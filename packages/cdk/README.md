# CDK

This package contains the AWS Cloud Development Kit (CDK) infrastructure code for the Ticketing system.

## Description

The CDK package defines the AWS infrastructure as code, allowing for automated deployment of the entire application stack. It creates and configures all necessary AWS resources.

Key features:
- Infrastructure as code using AWS CDK
- CI/CD pipeline configuration
- Monitoring and alerting setup
- Secure deployment with proper IAM permissions

## Project setup

```bash
$ npm install
```

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Project Structure

```
lib/
├── stacks/           # CDK stack definitions
│   ├── service.stack.ts    # Main service resources
│   ├── pipeline.stack.ts   # CI/CD pipeline configuration
│   └── monitoring.stack.ts # Monitoring resources
├── pipeline.stage.ts # Pipeline stage definition
└── index.ts          # Entry point
