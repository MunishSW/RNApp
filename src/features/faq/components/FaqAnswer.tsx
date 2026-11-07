import React, { useMemo } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { faqLayout, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { AnswerBlock, AnswerRun, parseAnswerHtml } from '../parseAnswerHtml';

interface FaqAnswerProps {
  html?: string | null;
}

/** A link that cannot be opened does nothing and never crashes (FR-4.3-02). */
function openLink(href: string) {
  try {
    Promise.resolve(Linking.openURL(href)).catch(() => undefined);
  } catch {
    // ignored on purpose
  }
}

/** Answer HTML shown as styled text: no WebView, nothing executed (BR-5, FR-4.3-01 to FR-4.3-03). */
export function FaqAnswer({ html }: FaqAnswerProps) {
  const theme = useTheme();
  const blocks = useMemo(() => parseAnswerHtml(html), [html]);

  const renderRun = (run: AnswerRun, index: number) => {
    const styled = run.bold || run.italic || run.underline || run.href;
    if (!styled) {
      return run.text;
    }
    return (
      <Text
        key={index}
        style={[
          run.bold && styles.bold,
          run.italic && styles.italic,
          (run.underline || run.href) && styles.underline,
          run.href ? { color: theme.faqLink } : null,
        ]}
        accessibilityRole={run.href ? 'link' : undefined}
        onPress={run.href ? () => openLink(run.href as string) : undefined}>
        {run.text}
      </Text>
    );
  };

  const renderBlock = (block: AnswerBlock, index: number) => {
    const body = (
      <Text
        style={[styles.text, { color: theme.faqText }, block.kind === 'listItem' && styles.itemText]}>
        {block.runs.map(renderRun)}
      </Text>
    );
    if (block.kind === 'listItem') {
      return (
        <View key={index} style={styles.item}>
          <Text style={[styles.text, styles.marker, { color: theme.faqText }]}>{block.marker}</Text>
          {body}
        </View>
      );
    }
    return <View key={index}>{body}</View>;
  };

  return (
    <View testID="faq-answer" style={styles.container}>
      {blocks.map(renderBlock)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: faqLayout.answerBlockGap },
  text: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: faqLayout.questionFontSize,
    lineHeight: faqLayout.questionLineHeight,
  },
  item: { flexDirection: 'row' },
  itemText: { flex: 1 },
  marker: { width: faqLayout.listMarkerWidth },
  bold: { fontFamily: typography.fontFamilyBold, fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  underline: { textDecorationLine: 'underline' },
});
