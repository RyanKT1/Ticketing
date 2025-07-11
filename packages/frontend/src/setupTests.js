import 'whatwg-fetch';

window.appConfig = {
  apiEndpoint: 'https://test-api-endpoint.com',
  cloudFrontUrl: 'https://test-cloudfront-url.com/',
  auth: {
    region: 'test-region',
    userPoolId: 'test-user-pool-id',
    userPoolClientId: 'test-client-id',
    userPoolDomain: 'https://test-domain.com',
  },
};

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = (...args) => {
  if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (args[0]?.includes?.('Warning:')) {
    return;
  }
  originalConsoleWarn(...args);
};

console.log = (...args) => {
  if (
    args[0]?.includes?.('Configuration loaded:') ||
    (args[0]?.startsWith?.('https://') && args[0]?.includes?.('/logout?client_id='))
  ) {
    return;
  }
  originalConsoleLog(...args);
};

global.XMLHttpRequest = class {
  open() {}
  send() {}
  get status() {
    return 404;
  }
  get statusText() {
    return 'Not Found';
  }
};

afterEach(() => {
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});
