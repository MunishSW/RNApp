module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Some state and navigation libraries ship ES modules only; transform them so suites that import the store can run.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|immer|react-redux|@reduxjs/toolkit|redux|redux-thunk|reselect|@react-navigation)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.claude/', '<rootDir>/specs/'],
};
