import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { CONTACT_POPUP } from '../nonLoggedHomeConstants';

export type ContactRow = (typeof CONTACT_POPUP.rows)[number];

interface CustomerCarePopupProps {
  visible: boolean;
  onClose: () => void;
  onRowPress: (row: ContactRow) => void;
}

/** Popup height cap: window height minus insets minus 64 (BRD 4.6.4). */
export function popupMaxHeight(windowHeight: number, insetTop: number, insetBottom: number): number {
  return Math.max(0, windowHeight - insetTop - insetBottom - layout.popupInsetReserve);
}

export function CustomerCarePopup({ visible, onClose, onRowPress }: CustomerCarePopupProps) {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable
        testID="contact-popup-backdrop"
        accessible={false}
        style={[styles.scrim, { backgroundColor: theme.scrim }]}
        onPress={onClose}>
        <View
          testID="contact-popup"
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              backgroundColor: theme.dialogSurface,
              maxHeight: popupMaxHeight(height, insets.top, insets.bottom),
            },
          ]}
          // Taps inside the card must not reach the backdrop
          onStartShouldSetResponder={() => true}>
          <ScrollView testID="contact-popup-scroll" contentContainerStyle={styles.content}>
            <Text
              accessibilityRole="header"
              style={[styles.heading, { color: theme.dialogText }]}>
              {CONTACT_POPUP.heading}
            </Text>
            {CONTACT_POPUP.rows.map(row => (
              <Pressable
                key={row.id}
                testID={`contact-row-${row.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${row.title}, ${row.subtitle}`}
                onPress={() => onRowPress(row)}
                style={({ pressed }) => [
                  styles.row,
                  { borderColor: theme.dialogDivider },
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.rowTitle, { color: theme.dialogText }]}>{row.title}</Text>
                <Text style={[styles.rowSubtitle, { color: theme.dialogAction }]}>{row.subtitle}</Text>
              </Pressable>
            ))}
            <Pressable
              testID="contact-popup-close"
              accessibilityRole="button"
              accessibilityLabel={CONTACT_POPUP.closeLabel}
              onPress={onClose}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <Text style={[styles.closeText, { color: theme.dialogAction }]}>
                {CONTACT_POPUP.closeLabel}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 320, borderRadius: 8, overflow: 'hidden' },
  content: { padding: 20, gap: 12 },
  heading: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.dialogTitle.fontSize,
    lineHeight: typography.dialogTitle.lineHeight,
  },
  row: {
    minHeight: layout.minTouchTarget,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  rowTitle: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.dialogBody.fontSize,
    lineHeight: typography.dialogBody.lineHeight,
  },
  rowSubtitle: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.dialogBody.fontSize,
    lineHeight: typography.dialogBody.lineHeight,
  },
  close: {
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontFamily: typography.fontFamilyMedium, fontSize: typography.dialogBody.fontSize },
  pressed: { opacity: 0.6 },
});
