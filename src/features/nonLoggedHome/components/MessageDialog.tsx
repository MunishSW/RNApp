import React, { useEffect } from 'react';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { layout, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';

export interface DialogButton {
  label: string;
  onPress: () => void;
  testID?: string;
}

interface MessageDialogProps {
  visible: boolean;
  message: string;
  buttons: DialogButton[];
  /** Omit for dialogs that cannot be dismissed (Android back does nothing) */
  onRequestClose?: () => void;
  /** Announce the message to screen readers when it appears */
  announce?: boolean;
  testID?: string;
}

const noop = () => undefined;

/** Shared centred message dialog: message plus buttons, no close icon. */
export function MessageDialog({
  visible,
  message,
  buttons,
  onRequestClose,
  announce = false,
  testID,
}: MessageDialogProps) {
  const theme = useTheme();

  useEffect(() => {
    if (visible && announce) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [visible, announce, message]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose ?? noop}>
      <View style={[styles.scrim, { backgroundColor: theme.scrim }]}>
        <View
          testID={testID}
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={[styles.card, { backgroundColor: theme.dialogSurface }]}>
          <Text style={[styles.message, { color: theme.dialogText }]}>{message}</Text>
          <View style={styles.actions}>
            {buttons.map(button => (
              <Pressable
                key={button.label}
                testID={button.testID}
                accessibilityRole="button"
                accessibilityLabel={button.label}
                onPress={button.onPress}
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                <Text style={[styles.actionText, { color: theme.dialogAction }]}>{button.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 320, borderRadius: 8, padding: 20, gap: 20 },
  message: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.dialogBody.fontSize,
    lineHeight: typography.dialogBody.lineHeight,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8 },
  action: {
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  actionText: { fontFamily: typography.fontFamilyMedium, fontSize: typography.dialogBody.fontSize },
});
