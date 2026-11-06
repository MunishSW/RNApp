import React, { useEffect } from 'react';
import { AccessibilityInfo, ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { LOADING_LABEL } from '../nonLoggedInHomeConstants';

interface LoadingOverlayProps {
  visible: boolean;
}

const noop = () => undefined;

/** Blocking spinner: touches and Android back are swallowed while visible; announced (FR-4.5-03, FR-4.5-08). */
export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  const theme = useTheme();

  useEffect(() => {
    if (visible) {
      AccessibilityInfo.announceForAccessibility(LOADING_LABEL);
    }
  }, [visible]);

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
