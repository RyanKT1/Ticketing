import { App } from 'aws-cdk-lib';
import { PipelineStack } from './stacks/pipeline.stack';

const baseStackProps = {
  env: {
    account: '431302473588',
    region: 'eu-west-2',
  },
};

const app = new App();
new PipelineStack(app, 'TicketingPipeline', {
  ...baseStackProps,
});
app.synth();
