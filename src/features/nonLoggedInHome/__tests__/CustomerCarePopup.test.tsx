import React from 'react';
import { act } from '@testing-library/react-native';
import { Dimensions, Modal, StyleSheet, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CustomerCarePopup, popupMaxHeight } from '../components/CustomerCarePopup';

function setup(visible = true) {
  const onClose = jest.fn();
  const onRowPress = jest.fn();
  const utils = render(<CustomerCarePopup visible={visible} onClose={onClose} onRowPress={onRowPress} />);
  return { onClose, onRowPress, ...utils };
}

describe('CustomerCarePopup', () => {
  // Covers: HOME_CONTACT_TC_001 - exact heading and three rows (FR-043, P-06)
  it('[HOME_CONTACT_TC_001] shows "We are here to help!" with Call Us, Email Us and Find Us and their details', () => {
    setup();
    expect(screen.getByText('We are here to help!')).toBeTruthy();
    expect(screen.getByText('Call Us')).toBeTruthy();
    expect(screen.getByText('022-45297300')).toBeTruthy();
    expect(screen.getByText('Email Us')).toBeTruthy();
    expect(screen.getByText('bhflwecare@bajajhousing.co.in')).toBeTruthy();
    expect(screen.getByText('Find Us')).toBeTruthy();
    expect(screen.getByText('Branch locator')).toBeTruthy();
  });

  // modal for screen readers, heading role, button rows (FR-044, FR-066)
  it('is modal for screen readers with a header and button rows', () => {
    setup();
    expect(screen.getByTestId('contact-popup').props.accessibilityViewIsModal).toBe(true);
    expect(screen.getByRole('header').props.children).toBe('We are here to help!');
    expect(screen.getByRole('button', { name: 'Call Us, 022-45297300' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Email Us, bhflwecare@bajajhousing.co.in' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Find Us, Branch locator' })).toBeTruthy();
  });

  // each row reports its id (FR-045)
  it('reports the pressed row', () => {
    const { onRowPress } = setup();
    fireEvent.press(screen.getByTestId('contact-row-call'));
    fireEvent.press(screen.getByTestId('contact-row-email'));
    fireEvent.press(screen.getByTestId('contact-row-find'));
    expect(onRowPress.mock.calls.map(c => c[0])).toEqual(['call', 'email', 'find']);
  });

  // Covers: HOME_CONTACT_TC_002 - close control, outside tap and Android back all close it (FR-046, E-11)
  it('[HOME_CONTACT_TC_002] closes from the close control, an outside tap and Android back', () => {
    const { onClose } = setup();
    fireEvent.press(screen.getByTestId('contact-popup-close'));
    fireEvent.press(screen.getByTestId('contact-popup-backdrop'));
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  // Covers: HOME_CONTACT_TC_004 - height cap is window - insets - 64 and the content scrolls (FR-047, E-01, E-02)
  it('caps its height at window minus insets minus 64 and scrolls inside', () => {
    expect(popupMaxHeight(800, 24, 34)).toBe(678);
    expect(popupMaxHeight(100, 50, 50)).toBe(0);
    setup();
    const card = StyleSheet.flatten(screen.getByTestId('contact-popup').props.style);
    expect(typeof card.maxHeight).toBe('number');
    expect(screen.getByTestId('contact-popup-scroll')).toBeTruthy();
  });

  // Covers: HOME_CONTACT_TC_004 - at 2x text the card height is capped at the exact window-minus-insets-minus-64 value, the content scrolls and no text has a fixed height
  it('[HOME_CONTACT_TC_004] caps the card at the exact height and leaves text unclipped at large text sizes', () => {
    const original = Dimensions.get('window');
    const large = { width: 360, height: 640, scale: 3, fontScale: 2 };
    act(() => {
      Dimensions.set({ window: large, screen: large });
    });
    try {
      setup();
      const card = StyleSheet.flatten(screen.getByTestId('contact-popup').props.style);
      expect(card.maxHeight).toBe(popupMaxHeight(640, 0, 0));
      expect(card.maxHeight).toBe(576);
      expect(screen.getByTestId('contact-popup-scroll')).toBeTruthy();
      screen.UNSAFE_getAllByType(Text).forEach(node => {
        const style = StyleSheet.flatten(node.props.style) ?? {};
        expect(style.height).toBeUndefined();
        expect(style.maxHeight).toBeUndefined();
        expect(node.props.numberOfLines).toBeUndefined();
      });
    } finally {
      act(() => {
        Dimensions.set({ window: original, screen: original });
      });
    }
  });

  // hidden by default (FR-043)
  it('shows nothing when not visible', () => {
    setup(false);
    expect(screen.queryByText('We are here to help!')).toBeNull();
  });
});
