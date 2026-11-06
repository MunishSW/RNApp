import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CommonMessageDialog } from '../components/CommonMessageDialog';
import { SERVER_ERROR_MESSAGE } from '../nonLoggedInHomeConstants';

describe('CommonMessageDialog', () => {
  afterEach(() => jest.restoreAllMocks());

  // Covers: FR-4.5-06, N-02, TC-303 - exact message, one "Okay" button, no close icon
  it('[TC-303] shows the message and a single "Okay" button', () => {
    render(<CommonMessageDialog visible message={SERVER_ERROR_MESSAGE} onOkay={jest.fn()} />);
    expect(
      screen.getByText(
        'Your request could not be processed at this moment. Request you to try again after sometime.',
      ),
    ).toBeTruthy();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].props.accessibilityLabel).toBe('Okay');
  });

  // Covers: FR-4.5-06 - "Okay" and Android back both close it
  it('calls onOkay from the button and from the Android back request', () => {
    const onOkay = jest.fn();
    render(<CommonMessageDialog visible message="m" onOkay={onOkay} />);
    fireEvent.press(screen.getByRole('button', { name: 'Okay' }));
    expect(onOkay).toHaveBeenCalledTimes(1);
    fireEvent(screen.UNSAFE_getByType(require('react-native').Modal), 'requestClose');
    expect(onOkay).toHaveBeenCalledTimes(2);
  });

  // Covers: FR-4.5-08, FR-7.4, E-04 - announced to screen readers and modal for them
  it('announces the message and is modal for screen readers', () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    render(<CommonMessageDialog visible message="Something failed" onOkay={jest.fn()} />);
    expect(announce).toHaveBeenCalledWith('Something failed');
    expect(screen.getByTestId('common-message-dialog').props.accessibilityViewIsModal).toBe(true);
  });

  it('renders nothing when not visible', () => {
    render(<CommonMessageDialog visible={false} message="m" onOkay={jest.fn()} />);
    expect(screen.queryByText('m')).toBeNull();
  });
});
