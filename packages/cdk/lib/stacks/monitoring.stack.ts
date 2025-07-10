
import { Stack, StackProps } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface MonitoringStackProps extends StackProps {
  stageName: string
}

export class MonitoringStack extends Stack {
  public readonly apiGatewayLogGroup: LogGroup;
  public readonly lambdaLogGroup: LogGroup;
  
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);
    
     this.apiGatewayLogGroup = new LogGroup(this, `${props.stageName}-apigateway-logs`, {
      retention: RetentionDays.TWO_WEEKS,
      logGroupName: `/aws/apigateway/${props.stageName}-ticketing-api`
    });
  
    this.lambdaLogGroup = new LogGroup(this, `${props.stageName}-lambda-logs`, {
      retention: RetentionDays.TWO_WEEKS,
      logGroupName: `/aws/lambda/${props.stageName}-ticketing-lambda`
    });

  }
} 