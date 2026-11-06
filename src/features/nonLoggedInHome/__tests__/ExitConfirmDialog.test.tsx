import React from 'react';
import { Modal } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ExitConfirmDialog } from '../components/ExitConfirmDialog';

function setup(visible = true) {
  const onCancel = jest.fn();
  const onOkay = jest.fn();
  render(<ExitConfirmDialog visible={visible} onCancel={onCancel} onOkay={onOkay} />);
  return { onCancel, onOkay };
}

describe('ExitConfirmDialog', () => {
  // Covers: FR-4.8-01, P-11, TC-501 - exact message, "CANCEL" and "Okay"
  it('[TC-501] shows "Are you sure you want to exit!" with "CANCEL" and "Okay"', () => {
    setup();
    expect(screen.getByText('Are you sure you want to exit!')).toBeTruthy();
    expect(screen.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual(['CANCEL', 'Okay']);
  });

  // Covers: FR-4.8-02, P-11, P-12, TC-502 - handlers
  it('[TC-502] calls the matching handler for "CANCEL" and "Okay"', () => {
    const { onCancel, onOkay } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'CANCEL' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole('button', { name: 'Okay' }));
    expect(onOkay).toHaveBeenCalledTimes(1);
  });

  // Covers: FR-4.8-02 - the Android back request on the dialog means cancel
  it('treats an Android back request as cancel', () => {
    const { onCancel, onOkay } = setup();
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOkay).not.toHaveBeenCalled();
  });

  // Covers: FR-4.8-01 - modal for screen readers; hidden when not visible
  it('is modal for screen readers and shows nothing when not visible', () => {
    setup();
    expect(screen.getByTestId('exit-confirm-dialog').props.accessibilityViewIsModal).toBe(true);
  });

  it('renders nothing when not visible', () => {
    setup(false);
    expect(screen.queryByText('Are you sure you want to exit!')).toBeNull();
  });
});
