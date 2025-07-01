
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AccessLogFormat, Deployment, LambdaRestApi, LogGroupLogDestination } from 'aws-cdk-lib/aws-apigateway';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { ARecord, PublicHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path'

interface ServiceStackProps extends StackProps {
  apiGatewayLogGroup : LogGroup
  stageName: string
}

const lambdaPath = path.join(__dirname, '../../../../packages/backend');

export class ServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

  const domainName = `${props.stageName}.qadeviceticketing.com`
  const ticketingLambda = new Function(this, 'TicketingLambda', {
  runtime: Runtime.NODEJS_18_X,
  handler: 'dist/lambda.handler', 
  code: Code.fromAsset(lambdaPath),
  functionName:"TicketingLambda"
    }); 

    const devicesTable = new Table(this,'devices',{
    tableName:'devices',
    partitionKey:{
        name:'id',
        type: AttributeType.STRING
    }
  })
   const ticketsTable = new Table(this,'tickets',{
    tableName:'tickets',
    partitionKey:{
        name:'id',
        type: AttributeType.STRING
    }
  })
  devicesTable.grantReadWriteData(ticketingLambda)
  ticketsTable.grantReadWriteData(ticketingLambda)

  const hostBucket = new Bucket(this,'HostBucket',{
    bucketName:domainName,
    versioned:true,
    publicReadAccess:false,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects:true,
    enforceSSL:true
  })
  /*
  const zone = new PublicHostedZone(this,'zone',{
    zoneName:domainName,
    
  })

*/

 /* const certificate = new Certificate(this,'Certificate',{
    domainName: domainName,
    validation: CertificateValidation.fromDns(zone),
    certificateName:"Certificate"
  })
*/

  const ticketingDistribution = new Distribution(this,`${props.stageName}-Ticketing-Distribution`,{
    defaultBehavior:{
      origin: S3BucketOrigin.withOriginAccessControl(hostBucket),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    },
  
  })
   /* new ARecord(this, 'AliasRecord',{
      recordName:domainName,
      zone:zone,
      target:RecordTarget.fromAlias(new CloudFrontTarget(ticketingDistribution))

    })*/
    new BucketDeployment(this,'BucketDeployment',{
      sources:[Source.asset(path.join(__dirname, '../../../../packages/frontend/dist'))],
      destinationBucket:hostBucket,
      distribution:ticketingDistribution,
      distributionPaths:['/*']
    })

  
  const ticketingApiGateway = new LambdaRestApi(this,'TicketingApi',{
    restApiName:'TicketingApi',
    handler:ticketingLambda,
    proxy:true,
    cloudWatchRole:true,
    deployOptions:{
      accessLogDestination: new LogGroupLogDestination(props.apiGatewayLogGroup),
      accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      stageName:props.stageName

    }
  })

  }
 
}
