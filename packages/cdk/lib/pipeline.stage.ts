import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ServiceStack } from "./stacks/service.stack";
import { MonitoringStack } from "./stacks/monitoring.stack";


export class PipelineStage extends Stage{
    constructor(scope:Construct, stageName:string, props?:StageProps){
        super(scope,stageName,props)
        
        
        const monitoringStack = new MonitoringStack(this,`${stageName}-Monitoring-Stack`,{...props,stackName:`${stageName}-Monitoring-Stack`,stageName:stageName})
        new ServiceStack(this,`${stageName}-Service-Stack`,{...props,stackName:`${stageName}-Service-Stack`,stageName:stageName, apiGatewayLogGroup:monitoringStack.apiGatewayLogGroup,lambdaLogGroup:monitoringStack.lambdaLogGroup})
       

    }
}