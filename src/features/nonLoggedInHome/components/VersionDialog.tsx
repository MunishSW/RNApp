import React from 'react';
import { Platform } from 'react-native';
import type { VersionOutcome } from '../../../services/versionService';
import {
  EXIT_LABEL,
  SKIP_LABEL,
  UPDATE_LABEL,
  UPDATE_MESSAGE,
} from '../nonLoggedInHomeConstants';
import { CommonMessageDialog } from './CommonMessageDialog';
import { DialogButton, MessageDialog } from './MessageDialog';

interface VersionDialogProps {
  outcome: VersionOutcome;
  onUpdate: (targetUrl: string) => void;
  onExit: () => void;
  onSkip: () => void;
  onOkay: () => void;
}

/**
 * Maintenance and mandatory dialogs cannot be dismissed, not even by Android back (FR-4.7-05,
 * FR-4.7-06). "Exit" is Android only: iOS has no supported way to close the app. A session-expired
 * outcome shows nothing (FR-4.7-08).
 */
export function VersionDialog({ outcome, onUpdate, onExit, onSkip, onOkay }: VersionDialogProps) {
  if (outcome.kind === 'none' || outcome.kind === 'sessionExpired') {
    return null;
  }
  const exitButtons: DialogButton[] =
    Platform.OS === 'android' ? [{ label: EXIT_LABEL, onPress: onExit, testID: 'version-exit' }] : [];

  switch (outcome.kind) {
    case 'maintenance':
      return (
        <MessageDialog testID="version-dialog" visible message={outcome.message} buttons={exitButtons} />
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
      return <CommonMessageDialog visible message={outcome.message} onOkay={onOkay} />;
  }
}
