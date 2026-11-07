import React, { useEffect } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { faqLayout, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { EMPTY_MESSAGE, ERROR_MESSAGE, LOADING_LABEL, RETRY_LABEL } from '../faqConstants';

interface FaqStateViewProps {
  variant: 'loading' | 'empty' | 'error';
  onRetry?: () => void;
}

/** Loading, empty and error body of the page (FR-4.5-01, FR-4.5-03, FR-4.5-04). Shown inside the page, never as a dialog. */
export function FaqStateView({ variant, onRetry }: FaqStateViewProps) {
  const theme = useTheme();

  useEffect(() => {
    if (variant === 'loading') {
      AccessibilityInfo.announceForAccessibility(LOADING_LABEL);
    } else if (variant === 'error') {
      AccessibilityInfo.announceForAccessibility(ERROR_MESSAGE);
    }
  }, [variant]);

  if (variant === 'loading') {
    return (
      <View style={styles.center}>
        <View
          testID="faq-loader"
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={LOADING_LABEL}
          accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={theme.faqLink} />
        </View>
      </View>
    );
  }

  const message = variant === 'error' ? ERROR_MESSAGE : EMPTY_MESSAGE;
  return (
    <View style={styles.center}>
      <Text
        testID={variant === 'error' ? 'faq-error' : 'faq-empty'}
        accessibilityRole={variant === 'error' ? 'alert' : undefined}
        style={[styles.message, { color: theme.faqText }]}>
        {message}
      </Text>
      {variant === 'error' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={RETRY_LABEL}
          onPress={onRetry}
          style={[styles.retry, { borderColor: theme.faqLink }]}>
          <Text style={[styles.retryText, { color: theme.faqLink }]}>{RETRY_LABEL}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: faqLayout.listSide,
  },
  message: {
    textAlign: 'center',
    fontFamily: typography.fontFamilyRegular,
    fontSize: faqLayout.questionFontSize,
    lineHeight: faqLayout.questionLineHeight,
  },
  retry: {
    marginTop: faqLayout.cardPadding,
    minHeight: faqLayout.minTouchTarget,
    minWidth: faqLayout.minTouchTarget,
    paddingHorizontal: faqLayout.cardPadding,
    borderWidth: 1,
    borderRadius: faqLayout.cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: faqLayout.titleFontSize,
  },
});
