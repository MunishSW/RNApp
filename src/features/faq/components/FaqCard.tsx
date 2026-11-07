import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { chevronDownXml } from '../../../assets/faq';
import { faqLayout, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { STATE_COLLAPSED, STATE_EXPANDED } from '../faqConstants';
import { FaqAnswer } from './FaqAnswer';

interface FaqCardProps {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
}

/** One accordion card (Figma 2:2068): question, chevron, and the answer under the question when open (FR-4.2-01 to FR-4.2-04, FR-4.7-01, FR-4.7-03). */
export function FaqCard({ question, answer, expanded, onToggle }: FaqCardProps) {
  const theme = useTheme();
  const turn = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // One short, non-looping animation (FR-4.2-04). JS-driven so a 150 ms rotate is verifiable in tests.
    const animation = Animated.timing(turn, {
      toValue: expanded ? 1 : 0,
      duration: faqLayout.chevronAnimationMs,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [expanded, turn]);

  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={question}
      accessibilityState={{ expanded }}
      accessibilityValue={{ text: expanded ? STATE_EXPANDED : STATE_COLLAPSED }}
      onPress={onToggle}
      style={[styles.card, { backgroundColor: theme.faqCardBackground }]}>
      <View style={styles.row}>
        <Text style={[styles.question, { color: theme.faqText }]}>{question}</Text>
        <Animated.View
          testID="faq-chevron"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ transform: [{ rotate }] }}>
          <SvgXml
            xml={chevronDownXml}
            width={faqLayout.chevronSize}
            height={faqLayout.chevronSize}
          />
        </Animated.View>
      </View>
      {expanded ? (
        <View style={styles.answer}>
          <FaqAnswer html={answer} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: faqLayout.cardRadius,
    padding: faqLayout.cardPadding,
    minHeight: faqLayout.minTouchTarget,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  question: {
    flex: 1,
    marginRight: faqLayout.chevronGap,
    fontFamily: typography.fontFamilyRegular,
    fontSize: faqLayout.questionFontSize,
    lineHeight: faqLayout.questionLineHeight,
  },
  answer: { marginTop: faqLayout.answerGap },
});
