# Ticketing System

A full-stack ticketing system built with React, NestJS, and AWS CDK.

## Project Overview

- **Frontend**: React-based UI for ticket management
- **Backend**: NestJS API with AWS Lambda integration
- **CDK**: AWS CDK for deployment and infrastructure management

## Project Structure

```
ticketing/
├── packages/
│   ├── frontend/    # React frontend application
│   ├── backend/     # NestJS backend API
│   └── cdk/         # AWS CDK infrastructure code
└── build.sh         # Main build script
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- AWS CLI configured with appropriate credentials

### Development

To run the entire application locally:

1. Start the backend:
   ```
   cd packages/backend
   npm run start:dev
   ```

2. Start the frontend:
   ```
   cd packages/frontend
   npm run dev
   ```

### Building

To build all packages for deployment:

```
./build.sh
```

This script will:
1. Build and test the backend
2. Build and test the frontend
3. Build and synthesize the CDK stack

### Deployment

To deploy Pipeline run:

```
cd packages/cdk
npm run build
cdk bootstrap aws://{Beta_Account}/eu-west-2 --trust {Prod_Account} --trust-for-lookup {Prod_Account} --cloudformation-execution-policies arn:aws:iam::aws:policy/
npm run cdk bootstrap "aws://{Prod_Account}/eu-west-2"
cdk synth
cdk deploy
```