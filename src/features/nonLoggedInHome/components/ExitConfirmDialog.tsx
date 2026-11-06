import React from 'react';
import { CANCEL_LABEL, EXIT_CONFIRM_MESSAGE, OKAY_LABEL } from '../nonLoggedInHomeConstants';
import { MessageDialog } from './MessageDialog';

interface ExitConfirmDialogProps {
  visible: boolean;
  onCancel: () => void;
  onOkay: () => void;
}

/** "Are you sure you want to exit!" with "CANCEL" and "Okay" (FR-4.8-01, FR-4.8-02). Back means cancel. */
export function ExitConfirmDialog({ visible, onCancel, onOkay }: ExitConfirmDialogProps) {
  return (
    <MessageDialog
      testID="exit-confirm-dialog"
      visible={visible}
      message={EXIT_CONFIRM_MESSAGE}
      announce
      onRequestClose={onCancel}
      buttons={[
        { label: CANCEL_LABEL, onPress: onCancel, testID: 'exit-cancel' },
        { label: OKAY_LABEL, onPress: onOkay, testID: 'exit-okay' },
      ]}
    />
  );
}
