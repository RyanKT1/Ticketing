import {
  HttpStatus,
  ErrorCode,
  ErrorTypes,
  makeSuccessResponse,
  makeErrorResponse,
} from './response.helper';

describe('Response Helpers', () => {
  describe('makeSuccessResponse', () => {
    describe('when called with data', () => {
      it('should return a properly formatted success response', () => {
        const data = { id: '123', name: 'Test' };
        const result = makeSuccessResponse(data);

        expect(result).toEqual({
          success: true,
          data,
          statusCode: HttpStatus.OK,
        });
      });
    });

    describe('when called with null data', () => {
      it('should return a success response with null data', () => {
        const result = makeSuccessResponse(null);

        expect(result).toEqual({
          success: true,
          data: null,
          statusCode: HttpStatus.OK,
        });
      });
    });

    describe('when called with custom status code', () => {
      it('should return a success response with the specified status code', () => {
        const data = { id: '123', name: 'Test' };
        const result = makeSuccessResponse(data, HttpStatus.CREATED);

        expect(result).toEqual({
          success: true,
          data,
          statusCode: HttpStatus.CREATED,
        });
      });
    });
  });

  describe('makeErrorResponse', () => {
    describe('when called with an error type', () => {
      it('should return a properly formatted error response', () => {
        const errorType = ErrorTypes[ErrorCode.NOT_FOUND];
        const result = makeErrorResponse(errorType);

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Resource not found',
          },
          statusCode: HttpStatus.NOT_FOUND,
        });
      });
    });

    describe('when called with a custom message', () => {
      it('should return an error response with the custom message', () => {
        const errorType = ErrorTypes[ErrorCode.NOT_FOUND];
        const customMessage = 'Device not found';
        const result = makeErrorResponse(errorType, customMessage);

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: customMessage,
          },
          statusCode: HttpStatus.NOT_FOUND,
        });
      });
    });

    describe('when called with details', () => {
      it('should return an error response with the details', () => {
        const errorType = ErrorTypes[ErrorCode.VALIDATION_ERROR];
        const details = { field: 'name', message: 'Name is required' };
        const result = makeErrorResponse(errorType, undefined, details);

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation error',
            details,
          },
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });
    });

    describe('when called with custom message and details', () => {
      it('should return an error response with the custom message and details', () => {
        const errorType = ErrorTypes[ErrorCode.VALIDATION_ERROR];
        const customMessage = 'Invalid input data';
        const details = { field: 'name', message: 'Name is required' };
        const result = makeErrorResponse(errorType, customMessage, details);

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: customMessage,
            details,
          },
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });
    });
  });
});
