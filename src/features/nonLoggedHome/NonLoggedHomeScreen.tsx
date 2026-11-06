import React, { ComponentRef, useCallback, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { nonLoggedHomeAssets, NonLoggedHomeAssetKey } from '../../assets/nonLoggedHome';
import type { RootStackParamList } from '../../navigation/routes';
import type { NavigationLike } from '../../navigation/useGuardedNavigate';
import { layout, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { CommonMessageDialog } from './components/CommonMessageDialog';
import { CustomerCarePopup } from './components/CustomerCarePopup';
import { ExitConfirmDialog } from './components/ExitConfirmDialog';
import { LoadingOverlay } from './components/LoadingOverlay';
import { LoginButton } from './components/LoginButton';
import { QuickLinkTile } from './components/QuickLinkTile';
import { VersionDialog } from './components/VersionDialog';
import { useExitConfirm } from './hooks/useExitConfirm';
import { useFocusReset } from './hooks/useFocusReset';
import { useHomeActions } from './hooks/useHomeActions';
import { useNonLoggedToken } from './hooks/useNonLoggedToken';
import { useTextScaleLayout } from './hooks/useTextScaleLayout';
import { useVersionGate } from './hooks/useVersionGate';
import {
  HEADLINE,
  LOGIN_LABEL,
  QUICK_LINKS,
  QuickLinkConfig,
  QuickLinkId,
  SERVER_ERROR_MESSAGE,
} from './nonLoggedHomeConstants';

const ICONS: Record<QuickLinkId, NonLoggedHomeAssetKey> = {
  payNow: 'payNow',
  ourProducts: 'ourProducts',
  trackApplication: 'trackApplication',
  faqs: 'faqs',
  offers: 'offers',
  contactUs: 'contactUs',
};

type Props = NativeStackScreenProps<RootStackParamList, 'NonLoggedHome'>;

/** Non-Logged-In Home (Figma BHFL_prelogin 2:937). Composition only: behaviour lives in the hooks. */
export default function NonLoggedHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { stacked } = useTextScaleLayout();
  // The React Navigation object satisfies the minimal contract the hooks use.
  const nav = navigation as unknown as NavigationLike;

  const contactTileRef = useRef<ComponentRef<typeof Pressable>>(null);

  useNonLoggedToken();
  useFocusReset(nav);
  const version = useVersionGate();
  const actions = useHomeActions(nav);
  const exit = useExitConfirm({
    navigation: nav,
    popupOpen: actions.popupOpen,
    closePopup: actions.closePopup,
    blocked: version.blocking,
  });

  const closePopupAndRestoreFocus = useCallback(() => {
    actions.closePopup();
    const node = findNodeHandle(contactTileRef.current);
    if (node) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [actions]);

  const renderTile = (config: QuickLinkConfig) => (
    <QuickLinkTile
      key={config.id}
      ref={config.id === 'contactUs' ? contactTileRef : undefined}
      testID={`tile-${config.id}`}
      config={config}
      icon={nonLoggedHomeAssets[ICONS[config.id]]}
      onPress={actions.onTilePress}
      stacked={stacked}
    />
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.pageBackground }]}>
      <ScrollView
        testID="home-scroll"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
        ]}>
        <View style={styles.column}>
          <View style={styles.illustrationBlock}>
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden>
              <Image
                testID="home-illustration"
                source={nonLoggedHomeAssets.illustration}
                resizeMode="contain"
                style={styles.illustration}
              />
            </View>
            <Text testID="home-headline" style={[styles.headline, { color: theme.textOnPage }]}>
              {HEADLINE}
            </Text>
          </View>

          <View testID="home-grid" style={[styles.grid, stacked && styles.gridStacked]}>
            {stacked ? (
              QUICK_LINKS.map(renderTile)
            ) : (
              <>
                <View style={styles.row}>{QUICK_LINKS.slice(0, 3).map(renderTile)}</View>
                <View style={styles.row}>{QUICK_LINKS.slice(3).map(renderTile)}</View>
              </>
            )}
          </View>

          <View style={styles.cta}>
            <LoginButton testID="login-button" label={LOGIN_LABEL} onPress={actions.onLoginPress} />
          </View>
        </View>
      </ScrollView>

      <LoadingOverlay visible={actions.faq.loading} />
      <CommonMessageDialog
        visible={actions.faq.errorVisible}
        message={SERVER_ERROR_MESSAGE}
        onOkay={actions.faq.onErrorOkay}
      />
      <CustomerCarePopup
        visible={actions.popupOpen}
        onClose={closePopupAndRestoreFocus}
        onRowPress={actions.onContactRowPress}
      />
      <ExitConfirmDialog visible={exit.exitVisible} onCancel={exit.onCancel} onOkay={exit.onOkay} />
      <VersionDialog
        outcome={version.outcome}
        onUpdate={version.onUpdate}
        onExit={version.onExit}
        onSkip={version.onSkip}
        onOkay={version.onOkay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center' },
  column: { width: '100%', maxWidth: layout.columnMaxWidth, alignItems: 'center' },
  illustrationBlock: {
    width: 311,
    maxWidth: '100%',
    minHeight: layout.illustrationBlockMinHeight,
    paddingTop: layout.illustrationBlockPaddingTop,
    paddingBottom: layout.illustrationBlockPaddingBottom,
    gap: layout.illustrationBlockGap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: { width: layout.illustrationWidth, height: layout.illustrationHeight },
  headline: {
    width: '100%',
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.headline.fontSize,
    lineHeight: typography.headline.lineHeight,
    textAlign: 'center',
  },
  grid: { width: layout.gridWidth, maxWidth: '100%', marginTop: layout.blockGap, gap: layout.gridRowGap },
  gridStacked: { width: '100%', paddingHorizontal: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cta: { marginTop: layout.ctaTopGap, alignItems: 'center' },
});
