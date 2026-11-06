import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CustomerCarePopup, popupMaxHeight } from '../components/CustomerCarePopup';

function setup(visible = true) {
  const onClose = jest.fn();
  const onRowPress = jest.fn();
  const utils = render(<CustomerCarePopup visible={visible} onClose={onClose} onRowPress={onRowPress} />);
  return { onClose, onRowPress, ...utils };
}

describe('CustomerCarePopup', () => {
  // Covers: FR-4.6-01, P-06, TC-205 - exact heading and three rows
  it('[TC-205] shows "We are here to help!" with Call Us, Email Us and Find Us and their details', () => {
    setup();
    expect(screen.getByText('We are here to help!')).toBeTruthy();
    expect(screen.getByText('Call Us')).toBeTruthy();
    expect(screen.getByText('022-45297300')).toBeTruthy();
    expect(screen.getByText('Email Us')).toBeTruthy();
    expect(screen.getByText('bhflwecare@bajajhousing.co.in')).toBeTruthy();
    expect(screen.getByText('Find Us')).toBeTruthy();
    expect(screen.getByText('Branch locator')).toBeTruthy();
  });

  // Covers: FR-4.6-02, FR-7.4-01, TC-607 - modal for screen readers, heading role, button rows
  it('[TC-607] is modal for screen readers with a header and button rows', () => {
    setup();
    expect(screen.getByTestId('contact-popup').props.accessibilityViewIsModal).toBe(true);
    expect(screen.getByRole('header').props.children).toBe('We are here to help!');
    expect(screen.getByRole('button', { name: 'Call Us, 022-45297300' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Email Us, bhflwecare@bajajhousing.co.in' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Find Us, Branch locator' })).toBeTruthy();
  });

  // Covers: FR-4.6-03 - each row reports its id
  it('reports the pressed row', () => {
    const { onRowPress } = setup();
    fireEvent.press(screen.getByTestId('contact-row-call'));
    fireEvent.press(screen.getByTestId('contact-row-email'));
    fireEvent.press(screen.getByTestId('contact-row-find'));
    expect(onRowPress.mock.calls.map(c => c[0])).toEqual(['call', 'email', 'find']);
  });

  // Covers: FR-4.6-04, E-11, TC-208 - close control, outside tap and Android back all close it
  it('[TC-208] closes from the close control, an outside tap and Android back', () => {
    const { onClose } = setup();
    fireEvent.press(screen.getByTestId('contact-popup-close'));
    fireEvent.press(screen.getByTestId('contact-popup-backdrop'));
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  // Covers: FR-4.6-05, E-01, E-02 - height cap is window - insets - 64 and the content scrolls
  it('caps its height at window minus insets minus 64 and scrolls inside', () => {
    expect(popupMaxHeight(800, 24, 34)).toBe(678);
    expect(popupMaxHeight(100, 50, 50)).toBe(0);
    setup();
    const card = StyleSheet.flatten(screen.getByTestId('contact-popup').props.style);
    expect(typeof card.maxHeight).toBe('number');
    expect(screen.getByTestId('contact-popup-scroll')).toBeTruthy();
  });

  // Covers: FR-4.6-01 - hidden by default
  it('shows nothing when not visible', () => {
    setup(false);
    expect(screen.queryByText('We are here to help!')).toBeNull();
  });
});
