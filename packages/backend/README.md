# Backend

This is the backend application for the Ticketing system built with NestJS, a progressive Node.js framework for building efficient and scalable server-side applications.

## Description

The backend provides a RESTful API for managing tickets, devices, and messages. It uses AWS DynamoDB for data storage and is designed to be deployed as AWS Lambda functions. The application includes authentication via Amazon Cognito.

Key features:
- CRUD operations for tickets, devices, and messages
- Authentication and authorization
- Error handling and validation
- AWS Lambda integration
- DynamoDB data persistence

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## Run tests

```bash
# unit tests
$ npm run test
```

## NestJS Component Overview

### Modules
Modules are the building blocks of a NestJS application. Each feature area (tickets, devices, messages, auth) has its own module that encapsulates related components.

### Controllers
Controllers handle incoming HTTP requests and return responses to the client. They define the API endpoints and route requests to the appropriate service methods.

### Services
Services contain the business logic of the application. They are responsible for data processing, communication with repositories, and implementing the core functionality.

### Repositories
Repositories handle data access operations. They abstract the database interactions and provide methods for CRUD operations on entities.

### DTOs (Data Transfer Objects)
DTOs define the structure of data being transferred between the client and server. They help with validation and type safety.

### Entities
Entities represent the data models of the application. They define the structure of the data stored in the database.

### Guards
Guards determine whether a request should be handled by the route handler based on certain conditions (like authentication status or roles).

### Interceptors
Interceptors add extra logic to incoming requests or outgoing responses
## Project Structure

```
src/
├── auth/           # Authentication modules
├── devices/        # Device management modules
├── errors/         # Error handling
├── helpers/        # Helper functions
├── messages/       # Message management modules
├── tickets/        # Ticket management modules
├── app.module.ts   # Main application module
├── lambda.ts       # Application entry point for lambda
└── main.ts         # Application entry point for development
