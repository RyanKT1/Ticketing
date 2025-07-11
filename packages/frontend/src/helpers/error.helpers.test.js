import { ApiError } from './error.helpers';

describe('Error Helpers', () => {
  describe('ApiError', () => {
    describe('when created with code and message', () => {
      it('should set name to the provided code', () => {
        const error = new ApiError('TEST_ERROR', 'Test error message');

        expect(error.name).toBe('TEST_ERROR');
      });

      it('should set message to the provided message', () => {
        const error = new ApiError('TEST_ERROR', 'Test error message');

        expect(error.message).toBe('Test error message');
      });

      it('should be an instance of Error', () => {
        const error = new ApiError('TEST_ERROR', 'Test error message');

        expect(error).toBeInstanceOf(Error);
      });
    });

    describe('when thrown and caught', () => {
      it('should maintain its properties', () => {
        let caughtError;

        try {
          throw new ApiError('VALIDATION_ERROR', 'Invalid data');
        } catch (error) {
          caughtError = error;
        }

        expect(caughtError.name).toBe('VALIDATION_ERROR');
        expect(caughtError.message).toBe('Invalid data');
        expect(caughtError).toBeInstanceOf(ApiError);
        expect(caughtError).toBeInstanceOf(Error);
      });
    });

    describe('when used in promise rejection', () => {
      it('should be catchable in async/await', async () => {
        const asyncFunction = async () => {
          throw new ApiError('ASYNC_ERROR', 'Async error message');
        };

        await expect(asyncFunction()).rejects.toThrow(ApiError);
        await expect(asyncFunction()).rejects.toMatchObject({
          name: 'ASYNC_ERROR',
          message: 'Async error message',
        });
      });

      it('should be catchable with promise catch', () => {
        const promiseFunction = () => {
          return Promise.reject(new ApiError('PROMISE_ERROR', 'Promise error message'));
        };

        return promiseFunction().catch(error => {
          expect(error.name).toBe('PROMISE_ERROR');
          expect(error.message).toBe('Promise error message');
          expect(error).toBeInstanceOf(ApiError);
        });
      });
    });
  });
});
