
import { Stack, StackProps } from 'aws-cdk-lib';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';

import { PipelineStage } from '../pipeline.stage';

export class PipelineStack extends Stack {
  public readonly apiGatewayLogGroup : LogGroup
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    
   const pipeline = new CodePipeline(this,'TicketingPipeline',{
           pipelineName:"TicketingPipeline",
           crossAccountKeys:true,
           enableKeyRotation:true,
           synth: new ShellStep('Synth',{
               input:CodePipelineSource.gitHub('RyanKT1/Ticketing','main'),
               commands:['npm run build','npx cdk synth']
           })
       })
       const betaStage = pipeline.addStage(new PipelineStage(this,'beta',{
         env: {account:"437815003164",region:"eu-west-2"}}))
       betaStage.addPost(new ManualApprovalStep('Manual Approval Stage'))
       const prodStage = pipeline.addStage(new PipelineStage(this,'prod',{
         env: {account:"431302473588",region:"eu-west-2"}}
       ))
  }
} 