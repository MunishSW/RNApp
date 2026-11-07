import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigationLike } from '../../navigation/useGuardedNavigate';
import type { RootStackParamList } from '../../navigation/routes';
import { faqLayout } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { FaqCard } from './components/FaqCard';
import { FaqHeader } from './components/FaqHeader';
import { FaqStateView } from './components/FaqStateView';
import { useFaqBack } from './hooks/useFaqBack';
import { useFaqData } from './hooks/useFaqData';

type Props = NativeStackScreenProps<RootStackParamList, 'Faq'>;

/** Pre-login FAQ screen (Figma 2:2068). Composition only: data lives in useFaqData, back in useFaqBack. */
export default function FaqScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // The React Navigation object satisfies the minimal contract the hooks use.
  const nav = navigation as unknown as NavigationLike;
  const { state, items, retry } = useFaqData(nav);
  const { onBack } = useFaqBack(nav);
  const [open, setOpen] = useState<Record<number, boolean>>({});

  // Every time the screen is opened or returned to, all cards start closed (FR-4.2-06).
  useEffect(() => nav.addListener('focus', () => setOpen({})), [nav]);

  const toggle = useCallback((index: number) => {
    setOpen(current => ({ ...current, [index]: !current[index] }));
  }, []);

  return (
    <View testID="faq-screen" style={[styles.root, { backgroundColor: theme.faqPageBackground }]}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: theme.faqActionBar, paddingTop: insets.top }}>
        <FaqHeader onBack={onBack} />
      </View>
      {state === 'list' ? (
        <ScrollView
          testID="faq-scroll"
          contentContainerStyle={[
            styles.content,
            { paddingTop: faqLayout.listTop, paddingBottom: insets.bottom + faqLayout.listTop },
          ]}>
          <View testID="faq-column" style={styles.column}>
            {items.map((item, index) => (
              <FaqCard
                // The list is replaced as a whole and has no stable id; the index is the card key.
                key={index}
                question={item.question}
                answer={item.answer}
                expanded={open[index] === true}
                onToggle={() => toggle(index)}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <FaqStateView variant={state} onRetry={retry} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { alignItems: 'center' },
  column: {
    width: '100%',
    maxWidth: faqLayout.columnMaxWidth,
    paddingHorizontal: faqLayout.listSide,
    gap: faqLayout.cardGap,
  },
});
