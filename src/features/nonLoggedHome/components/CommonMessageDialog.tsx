import React from 'react';
import { OKAY_LABEL } from '../nonLoggedHomeConstants';
import { MessageDialog } from './MessageDialog';

interface CommonMessageDialogProps {
  visible: boolean;
  message: string;
  onOkay: () => void;
}

/** Shared error dialog: message and one "Okay" button, announced to screen readers (FR-014). */
export function CommonMessageDialog({ visible, message, onOkay }: CommonMessageDialogProps) {
  return (
    <MessageDialog
      testID="common-message-dialog"
      visible={visible}
      message={message}
      announce
      onRequestClose={onOkay}
      buttons={[{ label: OKAY_LABEL, onPress: onOkay, testID: 'common-message-okay' }]}
    />
  );
}
