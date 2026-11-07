import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { backArrowXml } from '../../../assets/faq';
import { faqLayout, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { BACK_LABEL, FAQ_TITLE } from '../faqConstants';

interface FaqHeaderProps {
  onBack: () => void;
}

const SLOP_X = (faqLayout.minTouchTarget - faqLayout.backArrowWidth) / 2;
const TITLE_LEFT = faqLayout.backArrowLeft + faqLayout.backArrowWidth + faqLayout.titleGap;
const SLOP_Y = (faqLayout.minTouchTarget - faqLayout.backArrowHeight) / 2;

/** The title comes first in the tree so screen readers read the title, then Back (quickstart M-2); both are placed absolutely.
 * Action bar (Figma 2:2068): 48 high, white back arrow 18 from the left, title 11 to its right (FR-4.1-01, FR-4.1-02, FR-4.7-02). */
export function FaqHeader({ onBack }: FaqHeaderProps) {
  const theme = useTheme();
  return (
    <View
      testID="faq-action-bar"
      style={[styles.bar, { backgroundColor: theme.faqActionBar }]}>
      <View testID="faq-title-slot" style={styles.titleSlot}>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.faqActionBarText }]}>
          {FAQ_TITLE}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={BACK_LABEL}
        hitSlop={{ top: SLOP_Y, bottom: SLOP_Y, left: SLOP_X, right: SLOP_X }}
        onPress={onBack}
        style={styles.back}>
        <SvgXml
          xml={backArrowXml}
          width={faqLayout.backArrowWidth}
          height={faqLayout.backArrowHeight}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: faqLayout.actionBarHeight,
    width: '100%',
  },
  back: {
    position: 'absolute',
    left: faqLayout.backArrowLeft,
    top: (faqLayout.actionBarHeight - faqLayout.backArrowHeight) / 2,
    width: faqLayout.backArrowWidth,
    height: faqLayout.backArrowHeight,
  },
  titleSlot: {
    position: 'absolute',
    left: TITLE_LEFT,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: faqLayout.titleFontSize,
  },
});
