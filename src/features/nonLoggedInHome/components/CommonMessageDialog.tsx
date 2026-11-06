import React from 'react';
import { OKAY_LABEL } from '../nonLoggedInHomeConstants';
import { MessageDialog } from './MessageDialog';

interface CommonMessageDialogProps {
  visible: boolean;
  message: string;
  onOkay: () => void;
}

/** Shared error dialog: the message and one "Okay" button, no close icon, announced (FR-4.5-06, FR-4.7-08). */
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
