import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  AccessLogFormat,
  LambdaRestApi,
  LogGroupLogDestination,
  MethodLoggingLevel,
} from "aws-cdk-lib/aws-apigateway";
import { Distribution, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  AccountRecovery,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolGroup,
} from "aws-cdk-lib/aws-cognito";
import { AttributeType, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import * as path from "path";
interface ServiceStackProps extends StackProps {
  apiGatewayLogGroup: LogGroup;
  lambdaLogGroup: LogGroup;
  stageName: string;
}

const lambdaPath = path.join(__dirname, "../../../../packages/backend");

export class ServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    const domainName = `${props.stageName}.qadeviceticketing.com`;
    const ticketingLambda = new Function(this, "TicketingLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "dist/main.handler",
      code: Code.fromAsset(lambdaPath),
      functionName: "TicketingLambda",
      logGroup: props.lambdaLogGroup,
    });

    const devicesTable = new Table(this, "devices", {
      tableName: "devices",
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      contributorInsightsEnabled: true,
    });
    const ticketsTable = new Table(this, "tickets", {
      tableName: "tickets",
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      contributorInsightsEnabled: true,
    });
    ticketsTable.addGlobalSecondaryIndex({
      indexName: "gsi",
      partitionKey: { name: "ticketOwner", type: AttributeType.STRING },
    });
    const messagesTable = new Table(this, "messages", {
      tableName: "messages",
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      contributorInsightsEnabled: true,
    });
    messagesTable.addGlobalSecondaryIndex({
      indexName: "gsi",
      partitionKey: { name: "ticketId", type: AttributeType.STRING },
    });
    devicesTable.grantReadWriteData(ticketingLambda);
    ticketsTable.grantReadWriteData(ticketingLambda);
    messagesTable.grantReadWriteData(ticketingLambda);

    const hostBucket = new Bucket(this, "HostBucket", {
      bucketName: domainName,
      versioned: true,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });
    new Bucket(this, "MessagesBucket", {
      bucketName: `${props.stageName}-ticketingmessagebucket`,
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
        defaultRootObject: "index.html",
      },
    );
    const distributionDomainUrl = `https://${ticketingDistribution.domainName}`;

    const ticketingAPI = new LambdaRestApi(this, "TicketingApi", {
      restApiName: "TicketingApi",
      handler: ticketingLambda,
      proxy: true,
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(
          props.apiGatewayLogGroup,
        ),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
        stageName: props.stageName,
        loggingLevel:MethodLoggingLevel.INFO,
        dataTraceEnabled:true,
        tracingEnabled:true,
        metricsEnabled:true
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [distributionDomainUrl],
        allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE","OPTIONS"],
        allowHeaders: ["Authorization", "Content-Type", "Origin", "Accept"],
        allowCredentials: true,
        exposeHeaders: ["Access-Control-Allow-Origin"],
      },
    });
    const apiEndpoint = `https://${ticketingAPI.restApiId}.execute-api.${this.region}.amazonaws.com/${props.stageName}`;
    const userPool = new UserPool(this, "TicketingUserPool", {
      userPoolName: `${props.stageName}-TicketingUserPool`,
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new UserPoolDomain(this, "TicketingUserPoolDomain", {
      userPool,
      cognitoDomain: {
        domainPrefix: `${props.stageName}-ticketing-app-user-pool-domain`,
      },
    });
    const userPoolDomain = `https://${props.stageName}-ticketing-app-user-pool-domain.auth.${this.region}.amazoncognito.com`;
    const userPoolClient = new UserPoolClient(this, "TicketingPoolClient", {
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
        callbackUrls: [`https://${ticketingDistribution.domainName}`],
        logoutUrls: [`https://${ticketingDistribution.domainName}`],
        scopes: [
          OAuthScope.EMAIL,
          OAuthScope.OPENID,
          OAuthScope.PROFILE,
          OAuthScope.COGNITO_ADMIN,
        ],
      },
    });
    new UserPoolGroup(this, `Admins`, {
      userPool,
      groupName: "Admins",
      precedence: 0,
    });
    new UserPoolGroup(this, `Users`, {
      userPool,
      groupName: "Users",
      precedence: 1,
    });

    ticketingLambda.addEnvironment("COGNITO_USER_POOL_ID", userPool.userPoolId);
    ticketingLambda.addEnvironment(
      "COGNITO_APP_CLIENT_ID",
      userPoolClient.userPoolClientId,
    );
    ticketingLambda.addEnvironment("CLOUDFRONT_DOMAIN", distributionDomainUrl);

    // need to create a config file that will be deployed alongside the
    // react application
    new AwsCustomResource(this, "ConfigUploader", {
      onUpdate: {
        service: "S3",
        action: "putObject",
        parameters: {
          Bucket: hostBucket.bucketName,
          Key: "config.json",
          Body: JSON.stringify(
            {
              apiEndpoint,
              auth: {
                region: this.region,
                userPoolId: userPool.userPoolId,
                userPoolClientId: userPoolClient.userPoolClientId,
                userPoolDomain,
              },
            },
            null,
            2,
          ),
          ContentType: "application/json",
          CacheControl: "no-cache",
        },
        physicalResourceId: PhysicalResourceId.of(
          "config-" + Date.now().toString(),
        ),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [hostBucket.arnForObjects("config.json")],
      }),
      logRetention: RetentionDays.ONE_DAY,
    });

    new BucketDeployment(this, "BucketDeployment", {
      sources: [
        Source.asset(
          path.join(__dirname, "../../../../packages/frontend/dist"),
        ),
      ],
      destinationBucket: hostBucket,
      distribution: ticketingDistribution,
      distributionPaths: ["/*"],
    });
  }
}
