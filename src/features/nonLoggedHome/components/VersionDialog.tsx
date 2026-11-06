import React from 'react';
import { Platform } from 'react-native';
import { VersionOutcome } from '../../../services/versionService';
import { EXIT_LABEL, OKAY_LABEL, SKIP_LABEL, UPDATE_LABEL, UPDATE_MESSAGE } from '../nonLoggedHomeConstants';
import { DialogButton, MessageDialog } from './MessageDialog';

interface VersionDialogProps {
  outcome: VersionOutcome;
  onUpdate: (targetUrl: string) => void;
  onExit: () => void;
  onSkip: () => void;
  onOkay: () => void;
}

/**
 * Maintenance and mandatory dialogs cannot be dismissed (not even by Android back).
 * Exit is Android-only: iOS has no supported way to close the app (BRD 2.6).
 */
export function VersionDialog({ outcome, onUpdate, onExit, onSkip, onOkay }: VersionDialogProps) {
  if (outcome.kind === 'none') {
    return null;
  }
  const exitButtons: DialogButton[] =
    Platform.OS === 'android' ? [{ label: EXIT_LABEL, onPress: onExit, testID: 'version-exit' }] : [];

  switch (outcome.kind) {
    case 'maintenance':
      return (
        <MessageDialog
          testID="version-dialog"
          visible
          message={outcome.message}
          buttons={exitButtons}
        />
      );
    case 'mandatory':
      return (
        <MessageDialog
          testID="version-dialog"
          visible
          message={UPDATE_MESSAGE}
          buttons={[
            { label: UPDATE_LABEL, onPress: () => onUpdate(outcome.targetUrl), testID: 'version-update' },
            ...exitButtons,
          ]}
        />
      );
    case 'optional':
      return (
        <MessageDialog
          testID="version-dialog"
          visible
          message={UPDATE_MESSAGE}
          onRequestClose={onSkip}
          buttons={[
            { label: UPDATE_LABEL, onPress: () => onUpdate(outcome.targetUrl), testID: 'version-update' },
            { label: SKIP_LABEL, onPress: onSkip, testID: 'version-skip' },
          ]}
        />
      );
    default:
      return (
        <MessageDialog
          testID="version-dialog"
          visible
          message={outcome.message}
          announce
          onRequestClose={onOkay}
          buttons={[{ label: OKAY_LABEL, onPress: onOkay, testID: 'version-okay' }]}
        />
      );
  }
}
