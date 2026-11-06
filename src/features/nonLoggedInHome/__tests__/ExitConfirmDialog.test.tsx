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
  // Covers: HOME_BACK_TC_001 - exact message, "CANCEL" and "Okay" (FR-058, P-11)
  it('[HOME_BACK_TC_001] shows "Are you sure you want to exit!" with "CANCEL" and "Okay"', () => {
    setup();
    expect(screen.getByText('Are you sure you want to exit!')).toBeTruthy();
    expect(screen.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual(['CANCEL', 'Okay']);
  });

  // Covers: HOME_BACK_TC_002, HOME_BACK_TC_003 - handlers (FR-059, P-11, P-12)
  it('[HOME_BACK_TC_002] calls the matching handler for "CANCEL" and "Okay"', () => {
    const { onCancel, onOkay } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'CANCEL' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole('button', { name: 'Okay' }));
    expect(onOkay).toHaveBeenCalledTimes(1);
  });

  // the Android back request on the dialog means cancel (FR-059)
  it('treats an Android back request as cancel', () => {
    const { onCancel, onOkay } = setup();
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOkay).not.toHaveBeenCalled();
  });

  // modal for screen readers; hidden when not visible (FR-058)
  it('is modal for screen readers and shows nothing when not visible', () => {
    setup();
    expect(screen.getByTestId('exit-confirm-dialog').props.accessibilityViewIsModal).toBe(true);
  });

  it('renders nothing when not visible', () => {
    setup(false);
    expect(screen.queryByText('Are you sure you want to exit!')).toBeNull();
  });
});
