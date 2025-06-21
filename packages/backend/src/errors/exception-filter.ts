import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { ArgumentsHost, Catch, ConsoleLogger, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
//ryantodo  rename file structure and stuff

export type ResponseObject = {
    statusCode: number;
    timestamp: string;
    path: string;
    response: string | object;
    httpMethod: string;
};

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
    private readonly logger = new ConsoleLogger(ExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();
        const responseObject: ResponseObject = {
            statusCode: 500,
            timestamp: new Date().toString(),
            path: request.url,
            response: 'Internal Server Error',
            httpMethod: request.method,
        };
        if (exception instanceof HttpException) {
            responseObject.statusCode = exception.getStatus();
            responseObject.response = exception.getResponse();
        } else if (exception instanceof DynamoDBServiceException) {
            responseObject.statusCode = exception.$response?.statusCode!;
            responseObject.response = exception.$response?.reason!;
        }
        response.status(responseObject.statusCode).json(responseObject);
        this.logger.error(responseObject.response, ExceptionFilter.name);
        super.catch(exception, host);
    }
}
