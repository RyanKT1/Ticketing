import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  LogGroupLogDestination,
  MethodLoggingLevel,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  AccountRecovery,
  Mfa,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolGroup,
} from 'aws-cdk-lib/aws-cognito';
import { AttributeType, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import * as path from 'path';
interface ServiceStackProps extends StackProps {
  apiGatewayLogGroup: LogGroup;
  lambdaLogGroup: LogGroup;
  stageName: string;
}

const lambdaPath = path.join(__dirname, '../../../../packages/backend');

export class ServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    const domainName = `${props.stageName}.qadeviceticketing.com`;
    const ticketingLambda = new Function(this, 'TicketingLambda', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'dist/index.handler',
      code: Code.fromAsset(lambdaPath),
      functionName: 'TicketingLambda',
      logGroup: props.lambdaLogGroup,
    });

    const devicesTable = new Table(this, 'devices', {
      tableName: 'devices',
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      contributorInsightsEnabled: true,
    });
    const ticketsTable = new Table(this, 'tickets', {
      tableName: 'tickets',
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      contributorInsightsEnabled: true,
    });
    ticketsTable.addGlobalSecondaryIndex({
      indexName: 'gsi',
      partitionKey: { name: 'ticketOwner', type: AttributeType.STRING },
    });
    const messagesTable = new Table(this, 'messages', {
      tableName: 'messages',
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      contributorInsightsEnabled: true,
    });
    messagesTable.addGlobalSecondaryIndex({
      indexName: 'gsi',
      partitionKey: { name: 'ticketId', type: AttributeType.STRING },
    });
    devicesTable.grantReadWriteData(ticketingLambda);
    ticketsTable.grantReadWriteData(ticketingLambda);
    messagesTable.grantReadWriteData(ticketingLambda);

    const hostBucket = new Bucket(this, 'HostBucket', {
      bucketName: domainName,
      versioned: true,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    const ticketingDistribution = new Distribution(
      this,
      `${props.stageName}-Ticketing-Distribution`,
      {
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(hostBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: 'index.html',
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
        ],
      },
    );
    const distributionDomainUrl = `https://${ticketingDistribution.domainName}`;

    const userPool = new UserPool(this, `${props.stageName}-TicketingUserPool`, {
      userPoolName: `${props.stageName}-TicketingUserPool`,
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        phoneNumber: { required: false, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
      mfa: Mfa.REQUIRED,
      mfaSecondFactor: {
        otp: true,
        sms: true,
      },
    });

    const userPoolDomain = new UserPoolDomain(this, `${props.stageName}-TicketingUserPoolDomain`, {
      userPool,
      cognitoDomain: {
        domainPrefix: `${props.stageName}-ticketing-app-user-pool-domain`,
      },
    });
    const userPoolDomainUrl = `https://${props.stageName}-ticketing-app-user-pool-domain.auth.${this.region}.amazoncognito.com`;
    const userPoolClient = new UserPoolClient(this, `${props.stageName}-TicketingPoolClient`, {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        callbackUrls: [distributionDomainUrl],
        logoutUrls: [distributionDomainUrl],
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE, OAuthScope.COGNITO_ADMIN],
      },
    });
    userPoolDomain.signInUrl(userPoolClient, { redirectUri: distributionDomainUrl });
    new UserPoolGroup(this, `${props.stageName}-Admins`, {
      userPool,
      groupName: 'Admins',
      precedence: 0,
    });

    const cognitoAuthoriser = new CognitoUserPoolsAuthorizer(this, 'Authoriser', {
      cognitoUserPools: [userPool],
      authorizerName: 'Authoriser',
      identitySource: 'method.request.header.Authorization',
    });
    const ticketingApi = new RestApi(this, `${props.stageName}-Ticketing-Api`, {
      restApiName: 'TicketingApi',
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(props.apiGatewayLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
        stageName: props.stageName,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        tracingEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [distributionDomainUrl],
        allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Authorization', 'Content-Type', 'Origin', 'Accept'],
        allowCredentials: true,
        exposeHeaders: ['Access-Control-Allow-Origin'],
      },
    });
    const apiProxy = ticketingApi.root.addProxy({ anyMethod: false });
    apiProxy.addMethod('ANY', new LambdaIntegration(ticketingLambda), {
      authorizer: cognitoAuthoriser,
      authorizationType: AuthorizationType.COGNITO,
    });

    const apiEndpoint = `https://${ticketingApi.restApiId}.execute-api.${this.region}.amazonaws.com/${props.stageName}`;

    ticketingLambda.addEnvironment('CLOUDFRONT_DOMAIN', distributionDomainUrl);

    // need to create a config file that will be deployed alongside the
    // react application
    new AwsCustomResource(this, 'ConfigUploader', {
      onUpdate: {
        service: 'S3',
        action: 'putObject',
        parameters: {
          Bucket: hostBucket.bucketName,
          Key: 'config.json',
          Body: JSON.stringify(
            {
              apiEndpoint,
              auth: {
                region: this.region,
                userPoolId: userPool.userPoolId,
                userPoolClientId: userPoolClient.userPoolClientId,
                userPoolDomainUrl,
              },
            },
            null,
            2,
          ),
          ContentType: 'application/json',
          CacheControl: 'no-cache',
        },
        physicalResourceId: PhysicalResourceId.of('config-' + Date.now().toString()),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [hostBucket.arnForObjects('config.json')],
      }),
      logRetention: RetentionDays.ONE_DAY,
    });

    new BucketDeployment(this, 'BucketDeployment', {
      sources: [Source.asset(path.join(__dirname, '../../../../packages/frontend/dist'))],
      destinationBucket: hostBucket,
      distribution: ticketingDistribution,
      distributionPaths: ['/*'],
    });
  }
}
