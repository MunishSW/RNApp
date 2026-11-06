import { AccessibilityInfo, Linking } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useCustomerCare } from '../hooks/useCustomerCare';

const navigation = { navigate: jest.fn(), addListener: jest.fn(() => () => undefined) };

// The component under test reads these from the real module object, so spy on that, not on a namespace copy.
const ReactNativeModule = require('react-native');

beforeEach(() => {
  navigation.navigate.mockClear();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  (Linking.openURL as jest.Mock).mockClear();
});

afterEach(() => jest.restoreAllMocks());

describe('useCustomerCare', () => {
  // Covers: FR-4.6-01, BR-7, P-06 - opens as a popup, not a route
  it('opens and closes without navigating', () => {
    const { result } = renderHook(() => useCustomerCare(navigation));
    expect(result.current.visible).toBe(false);
    act(() => result.current.open());
    expect(result.current.visible).toBe(true);
    act(() => result.current.close());
    expect(result.current.visible).toBe(false);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  // Covers: FR-4.6-03, P-06 - Call Us opens the dialer and closes the popup
  it('Call Us closes the popup and opens the phone dialer for 022-45297300', () => {
    const { result } = renderHook(() => useCustomerCare(navigation));
    act(() => result.current.open());
    act(() => result.current.onRowPress('call'));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:02245297300');
    expect(result.current.visible).toBe(false);
  });

  // Covers: FR-4.6-03 - Email Us opens the mail app addressed to the support address
  it('Email Us closes the popup and opens the mail app', () => {
    const { result } = renderHook(() => useCustomerCare(navigation));
    act(() => result.current.open());
    act(() => result.current.onRowPress('email'));
    expect(Linking.openURL).toHaveBeenCalledWith('mailto:bhflwecare@bajajhousing.co.in');
    expect(result.current.visible).toBe(false);
  });

  // Covers: FR-4.6-03 - Find Us opens the Branch locator
  it('Find Us closes the popup and navigates to the Branch locator', () => {
    const { result } = renderHook(() => useCustomerCare(navigation));
    act(() => result.current.open());
    act(() => result.current.onRowPress('find'));
    expect(navigation.navigate).toHaveBeenCalledWith('BranchLocator');
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(result.current.visible).toBe(false);
  });

  // Covers: FR-4.6-03 - a failing hand-off never throws
  it('does not throw when the dialer cannot open', async () => {
    (Linking.openURL as jest.Mock).mockRejectedValue(new Error('no dialer'));
    const { result } = renderHook(() => useCustomerCare(navigation));
    act(() => result.current.open());
    expect(() => act(() => result.current.onRowPress('call'))).not.toThrow();
    await act(async () => undefined);
  });

  // Covers: FR-4.6-04, TC-208 - focus returns to the Contact Us tile when the popup closes
  it('[TC-208] moves accessibility focus back to the Contact Us tile on close', () => {
    jest.spyOn(ReactNativeModule, 'findNodeHandle').mockReturnValue(42);
    const focus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => undefined);
    focus.mockClear();
    const { result } = renderHook(() => useCustomerCare(navigation));
    act(() => result.current.open());
    act(() => result.current.close());
    expect(focus).toHaveBeenCalledWith(42);
  });

  // Covers: FR-4.6-01 - opening twice does not stack
  it('ignores a second open while already open', () => {
    const { result } = renderHook(() => useCustomerCare(navigation));
    act(() => result.current.open());
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.visible).toBe(false);
  });
});
