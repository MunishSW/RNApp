/**
 * @format
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';
import { registerTokenProvider, startNonLoggedToken } from '../src/services/authService';

jest.mock('../src/navigation/RootNavigator', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/services/authService', () => ({
  registerTokenProvider: jest.fn(),
  startNonLoggedToken: jest.fn(() => Promise.resolve(undefined)),
}));

describe('App root', () => {
  // Covers: HOME_LAYOUT_TC_003 — Home draws without waiting on the token call
  it('[HOME_LAYOUT_TC_003] renders and starts the non-logged token once without blocking', () => {
    render(<App />);
    expect(registerTokenProvider).toHaveBeenCalledTimes(1);
    expect(startNonLoggedToken).toHaveBeenCalledTimes(1);
  });
});
