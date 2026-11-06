/* eslint-env jest */
/* Native-module mocks shared by all unit tests (the real modules are never loaded). */

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    API_URL: 'https://api.example.test/Services/',
    AUTH_API_URL: 'https://auth.example.test/auth/',
    API_BASE_URL: 'https://host.example.test/',
    APP_NAME: 'BHFL Test',
    PORTAL_BASE_URL: 'https://portal.example.test',
    NON_LOGGED_AUTH_USERNAME: 'test-user',
    NON_LOGGED_AUTH_PASSWORD: 'test-pass',
    FIELD_ENCRYPTION_KEY: '000102030405060708090a0b0c0d0e0f',
    FIELD_ENCRYPTION_AAD: '0f0e0d0c0b0a09080706050403020100',
    STORAGE_ENCRYPTION_KEY: 'test-storage-key',
    REQUEST_TIMEOUT_MS: '30000',
  },
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getVersion: jest.fn(() => '1.8.9'),
    getBrand: jest.fn(() => 'TestBrand'),
    getModel: jest.fn(() => 'TestModel'),
    getSystemVersion: jest.fn(() => '14'),
  },
}));

jest.mock('react-native-mmkv', () => {
  const data = new Map();
  return {
    __esModule: true,
    createMMKV: jest.fn(() => ({
      set: (k, v) => data.set(k, v),
      getString: k => data.get(k),
      remove: k => data.delete(k),
    })),
  };
});

jest.mock('react-native-quick-crypto', () => ({
  __esModule: true,
  Buffer: global.Buffer,
  randomBytes: jest.fn(size => global.Buffer.alloc(size, 7)),
  createCipheriv: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
