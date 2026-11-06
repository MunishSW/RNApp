import React from 'react';
import { CANCEL_LABEL, EXIT_CONFIRM_MESSAGE, OKAY_LABEL } from '../nonLoggedHomeConstants';
import { MessageDialog } from './MessageDialog';

interface ExitConfirmDialogProps {
  visible: boolean;
  onCancel: () => void;
  onOkay: () => void;
}

export function ExitConfirmDialog({ visible, onCancel, onOkay }: ExitConfirmDialogProps) {
  return (
    <MessageDialog
      testID="exit-confirm-dialog"
      visible={visible}
      message={EXIT_CONFIRM_MESSAGE}
      onRequestClose={onCancel}
      buttons={[
        { label: CANCEL_LABEL, onPress: onCancel, testID: 'exit-cancel' },
        { label: OKAY_LABEL, onPress: onOkay, testID: 'exit-okay' },
      ]}
    />
  );
}
