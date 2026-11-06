import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { nonLoggedInHomeAssets } from '../../assets/nonLoggedInHome';
import type { RootStackParamList } from '../../navigation/routes';
import { layout, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { CommonMessageDialog } from './components/CommonMessageDialog';
import { CustomerCarePopup } from './components/CustomerCarePopup';
import { ExitConfirmDialog } from './components/ExitConfirmDialog';
import { LoadingOverlay } from './components/LoadingOverlay';
import { LoginButton } from './components/LoginButton';
import { VersionDialog } from './components/VersionDialog';
import { QuickLinkGrid } from './components/QuickLinkGrid';
import { useCustomerCare } from './hooks/useCustomerCare';
import { useExitConfirm } from './hooks/useExitConfirm';
import { useFocusReset } from './hooks/useFocusReset';
import { useHomeActions } from './hooks/useHomeActions';
import { useHomeBootstrap } from './hooks/useHomeBootstrap';
import type { NavigationLike } from './hooks/useGuardedNavigate';
import { useTextScaleLayout } from './hooks/useTextScaleLayout';
import {
  HEADLINE,
  LOGIN_LABEL,
  SERVER_ERROR_MESSAGE,
  TILES,
  TileId,
} from './nonLoggedInHomeConstants';

const ICONS = {
  payNow: nonLoggedInHomeAssets.payNow,
  ourProducts: nonLoggedInHomeAssets.ourProducts,
  trackApplication: nonLoggedInHomeAssets.trackApplication,
  faqs: nonLoggedInHomeAssets.faqs,
  offers: nonLoggedInHomeAssets.offers,
  contactUs: nonLoggedInHomeAssets.contactUs,
} satisfies Record<TileId, (typeof nonLoggedInHomeAssets)[keyof typeof nonLoggedInHomeAssets]>;

type Props = NativeStackScreenProps<RootStackParamList, 'NonLoggedInHome'>;

/** Non-Logged-In Home (Figma BHFL_prelogin 2:937). Composition only: behaviour lives in the hooks. */
export default function NonLoggedInHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { stacked } = useTextScaleLayout();
  // The React Navigation object satisfies the minimal contract the hooks use.
  const nav = navigation as unknown as NavigationLike;

  const version = useHomeBootstrap();
  useFocusReset(nav);
  const care = useCustomerCare(nav);
  const actions = useHomeActions(nav, { onContactPress: care.open });
  const dismissibleDialogOpen =
    actions.faq.errorVisible || version.outcome.kind === 'optional' || version.outcome.kind === 'error';
  const closeDialog = () => {
    if (actions.faq.errorVisible) {
      actions.faq.onErrorOkay();
    } else {
      version.onSkip();
    }
  };
  const exit = useExitConfirm({
    navigation: nav,
    popupOpen: care.visible,
    closePopup: care.close,
    dialogOpen: dismissibleDialogOpen,
    closeDialog,
    blocked: version.blocking || actions.faq.loading,
  });

  return (
    <View style={[styles.root, { backgroundColor: theme.pageBackground }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        testID="home-scroll"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom + layout.ctaTopGap },
        ]}>
        <View style={styles.column}>
          <View style={styles.illustrationBlock}>
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden>
              <Image
                testID="home-illustration"
                source={nonLoggedInHomeAssets.illustration}
                resizeMode="contain"
                style={styles.illustration}
              />
            </View>
            <Text testID="home-headline" style={[styles.headline, { color: theme.textOnPage }]}>
              {HEADLINE}
            </Text>
          </View>

          <QuickLinkGrid
            tiles={TILES}
            icons={ICONS}
            onTilePress={actions.onTilePress}
            stacked={stacked}
            contactTileRef={care.contactTileRef}
          />

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
        visible={care.visible}
        onClose={care.close}
        onRowPress={care.onRowPress}
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
  cta: { marginTop: layout.ctaTopGap, alignItems: 'center' },
});
