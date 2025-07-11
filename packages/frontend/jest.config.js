export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/mocks/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/mocks/file.mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/main.jsx',
    '!src/index.js',
    '!src/mocks/**',
    '!src/setupTests.js',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.mjs$)'
  ],
};
