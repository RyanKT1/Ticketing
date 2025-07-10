export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface ErrorType {
  code: ErrorCode;
  statusCode: HttpStatus;
  message: string;
}

export const ErrorTypes: Record<ErrorCode, ErrorType> = {
  [ErrorCode.BAD_REQUEST]: {
    code: ErrorCode.BAD_REQUEST,
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Bad request',
  },
  [ErrorCode.UNAUTHORIZED]: {
    code: ErrorCode.UNAUTHORIZED,
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Unauthorized',
  },
  [ErrorCode.FORBIDDEN]: {
    code: ErrorCode.FORBIDDEN,
    statusCode: HttpStatus.FORBIDDEN,
    message: 'Forbidden',
  },
  [ErrorCode.NOT_FOUND]: {
    code: ErrorCode.NOT_FOUND,
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Resource not found',
  },
  [ErrorCode.CONFLICT]: {
    code: ErrorCode.CONFLICT,
    statusCode: HttpStatus.CONFLICT,
    message: 'Resource conflict',
  },
  [ErrorCode.INTERNAL_ERROR]: {
    code: ErrorCode.INTERNAL_ERROR,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  },
  [ErrorCode.DATABASE_ERROR]: {
    code: ErrorCode.DATABASE_ERROR,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Database error',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    code: ErrorCode.VALIDATION_ERROR,
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Validation error',
  },
};

export interface SuccessResponse {
  success: true;
  data: any;
  statusCode: number;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  statusCode: number;
  timestamp: string;
}

export function makeSuccessResponse(
  data: any = null, 
  statusCode: number = HttpStatus.OK, 
): SuccessResponse {
  return {
    success: true,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

export function makeErrorResponse(
  errorType: ErrorType,
  customMessage?: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error: {
      code: errorType.code,
      message: customMessage || errorType.message,
      details,
    },
    statusCode: errorType.statusCode,
    timestamp: new Date().toISOString(),
  };
}
