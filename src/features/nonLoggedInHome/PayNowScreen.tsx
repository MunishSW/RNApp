import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { layout, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { BACK_LABEL, PAY_NOW_TITLE } from './nonLoggedInHomeConstants';

type Props = NativeStackScreenProps<RootStackParamList, 'NonLoggedInPayNow'>;

/**
 * Pay Now destination: a header titled "Pay Now" and a back button, nothing else (FR-4.2-05).
 * No web content, loader or error state. Back returns to Home (explicit target).
 */
export default function PayNowScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const title = route.params?.title ?? PAY_NOW_TITLE;

  return (
    <View style={[styles.root, { backgroundColor: theme.pageBackground }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          testID="pay-now-back"
          accessibilityRole="button"
          accessibilityLabel={BACK_LABEL}
          onPress={() => navigation.navigate(ROUTES.NonLoggedInHome)}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" accessibilityElementsHidden>
            <Path
              d="M15 5 L8 12 L15 19"
              fill="none"
              stroke={theme.textOnPage}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <Text
          testID="pay-now-title"
          accessibilityRole="header"
          style={[styles.title, { color: theme.textOnPage }]}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, minHeight: 56 },
  back: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  title: {
    flexShrink: 1,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.dialogTitle.fontSize,
    lineHeight: typography.dialogTitle.lineHeight,
  },
});
