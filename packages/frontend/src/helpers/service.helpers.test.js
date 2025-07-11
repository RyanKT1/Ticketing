import { getAuthHeaders, BASE_URL, loadConfig } from './service.helpers';

describe('Service Helpers', () => {
  describe('getAuthHeaders', () => {
    describe('when auth has user with access token', () => {
      it('should return headers with Authorization, Accept, and Content-Type', () => {
        const mockAuth = {
          user: {
            id_token: 'test-id-token',
          },
        };

        const headers = getAuthHeaders(mockAuth);

        expect(headers).toEqual({
          Authorization: 'Bearer test-id-token',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        });
      });
    });

    describe('when auth has no user', () => {
      it('should return headers with undefined Authorization', () => {
        const mockAuth = {};

        const headers = getAuthHeaders(mockAuth);

        expect(headers).toEqual({
          Authorization: 'Bearer undefined',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        });
      });
    });

    describe('when auth is undefined', () => {
      it('should return headers with undefined Authorization', () => {
        const headers = getAuthHeaders(undefined);

        expect(headers).toEqual({
          Authorization: 'Bearer undefined',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        });
      });
    });
  });

  describe('BASE_URL', () => {
    it('should be defined', () => {
      expect(BASE_URL).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof BASE_URL).toBe('string');
    });
  });

  describe('loadConfig', () => {
    let originalXHR;
    let mockXHR;

    beforeEach(() => {
      originalXHR = global.XMLHttpRequest;
      mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        responseText: JSON.stringify({
          apiEndpoint: 'https://test-api-endpoint.com',
          cloudFrontUrl: 'https://test-cloudfront-url.com/',
        }),
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      window.appConfig = {
        apiEndpoint: 'https://default-api-endpoint.com',
        cloudFrontUrl: 'https://default-cloudfront-url.com/',
      };
    });

    afterEach(() => {
      global.XMLHttpRequest = originalXHR;
    });

    describe('when config file is loaded successfully', () => {
      it('should update window.appConfig with loaded values', () => {
        loadConfig();

        expect(mockXHR.open).toHaveBeenCalledWith('GET', '/config.json', false);
        expect(mockXHR.send).toHaveBeenCalledWith(null);

        expect(window.appConfig).toEqual({
          apiEndpoint: 'https://test-api-endpoint.com',
          cloudFrontUrl: 'https://test-cloudfront-url.com/',
        });
      });
    });

    describe('when config file fails to load', () => {
      it('should keep default values', () => {
        mockXHR.status = 404;

        loadConfig();

        expect(window.appConfig).toEqual({
          apiEndpoint: 'https://default-api-endpoint.com',
          cloudFrontUrl: 'https://default-cloudfront-url.com/',
        });
      });
    });

    describe('when XMLHttpRequest throws an error', () => {
      it('should catch the error and keep default values', () => {
        mockXHR.send = jest.fn(() => {
          throw new Error('XHR error');
        });

        loadConfig();

        expect(window.appConfig).toEqual({
          apiEndpoint: 'https://default-api-endpoint.com',
          cloudFrontUrl: 'https://default-cloudfront-url.com/',
        });
      });
    });
  });
});
