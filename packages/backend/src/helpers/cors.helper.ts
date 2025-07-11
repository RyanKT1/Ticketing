import type { Response } from 'express';

export function createCorsResponse(res: Response, statusCode: number, body: any): Response {
  return res
    .header('Access-Control-Allow-Origin', process.env.CLOUDFRONT_DOMAIN)
    .header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
    .header('Access-Control-Allow-Headers', 'Authorization,Content-Type,Origin,Accept')
    .header('Access-Control-Allow-Credentials', 'true')
    .status(statusCode)
    .json(body);
}
