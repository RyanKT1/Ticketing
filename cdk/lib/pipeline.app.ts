import { App} from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';

import { PipelineStage } from './pipeline.stage';


export const setupApp = (app:App) =>{
   const pipeline = new CodePipeline(app,'TicketingPipeline',{
        pipelineName:"TicketingPipeline",
        synth: new ShellStep('Synth',{
            input:CodePipelineSource.gitHub('','main'),
            commands:['npm run build','npx cdk synth']
        })
    })
    const betaStage = pipeline.addStage(new PipelineStage(app,'beta',{
      env: {account:"445894897902",region:"eu-west-2"}}))
    betaStage.addPost(new ManualApprovalStep('Manual Approval Stage'))
    const prodStage = pipeline.addStage(new PipelineStage(app,'prod',{
      env: {account:"431302473588",region:"eu-west-2"}}
    ))

}


