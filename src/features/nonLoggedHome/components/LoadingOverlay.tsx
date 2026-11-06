import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { LOADING_LABEL } from '../nonLoggedHomeConstants';

interface LoadingOverlayProps {
  visible: boolean;
}

const noop = () => undefined;

/** Blocking spinner: touches and Android back are swallowed while it is visible. */
export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={noop}>
      <View
        testID="loading-overlay"
        accessibilityViewIsModal
        accessibilityLiveRegion="polite"
        accessibilityLabel={LOADING_LABEL}
        style={[styles.scrim, { backgroundColor: theme.scrim }]}>
        <ActivityIndicator size="large" color={theme.textOnPage} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
