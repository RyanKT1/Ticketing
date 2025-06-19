
import { Stack, StackProps } from 'aws-cdk-lib';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface MonitoringStackProps extends StackProps {
  stageName: string
}

export class MonitoringStack extends Stack {
  public readonly apiGatewayLogGroup : LogGroup
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);
    
    this.apiGatewayLogGroup = new LogGroup(this, `${props.stageName}-apigateway-logs`);

  }
} 