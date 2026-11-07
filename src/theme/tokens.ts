/**
 * Theme tokens. Raw colour values live only in this file (constitution II).
 * Source: Figma BHFL_prelogin (node 2:937). Dark and high-contrast sets alias
 * the light values until Design supplies remapped values (spec FR-021).
 */

export const palette = {
  brandBlue: '#035795',
  white: '#FFFFFF',
  ctaStart: '#FF512F',
  ctaEnd: '#F09819',
  scrim: 'rgba(0, 0, 0, 0.5)',
  dialogSurface: '#FFFFFF',
  dialogText: '#212121',
  dialogAction: '#035795',
  dialogDivider: '#E0E0E0',
  faqPageBackground: '#E3ECF5',
  faqChevron: '#FF5101',
  faqCardBackground: '#FFFFFF',
  faqText: '#000000',
  faqLink: '#035795',
} as const;

export interface ThemeTokens {
  pageBackground: string;
  textOnPage: string;
  ctaText: string;
  scrim: string;
  dialogSurface: string;
  dialogText: string;
  dialogAction: string;
  dialogDivider: string;
  faqPageBackground: string;
  faqChevron: string;
  faqCardBackground: string;
  faqText: string;
  faqLink: string;
  faqActionBar: string;
  faqActionBarText: string;
}

const light: ThemeTokens = {
  pageBackground: palette.brandBlue,
  textOnPage: palette.white,
  ctaText: palette.white,
  scrim: palette.scrim,
  dialogSurface: palette.dialogSurface,
  dialogText: palette.dialogText,
  dialogAction: palette.dialogAction,
  dialogDivider: palette.dialogDivider,
  faqPageBackground: palette.faqPageBackground,
  faqChevron: palette.faqChevron,
  faqCardBackground: palette.faqCardBackground,
  faqText: palette.faqText,
  faqLink: palette.faqLink,
  faqActionBar: palette.brandBlue,
  faqActionBarText: palette.white,
};

export const themes: Record<'light' | 'dark' | 'highContrast', ThemeTokens> = {
  light,
  dark: light,
  highContrast: light,
};

export const typography = {
  fontFamilyRegular: 'Rubik-Regular',
  fontFamilyMedium: 'Rubik-Medium',
  fontFamilySemiBold: 'Rubik-SemiBold',
  fontFamilyBold: 'Rubik-Bold',
  headline: { fontSize: 16, lineHeight: 22 },
  tileLabel: { fontSize: 11.889 },
  cta: { fontSize: 14 },
  dialogBody: { fontSize: 14, lineHeight: 20 },
  dialogTitle: { fontSize: 16, lineHeight: 22 },
} as const;

/** Figma numbers for the 360 x 812 reference frame. */
export const layout = {
  columnMaxWidth: 360,
  illustrationBlockMinHeight: 310,
  illustrationBlockPaddingTop: 22,
  illustrationBlockPaddingBottom: 14,
  illustrationBlockGap: 28,
  illustrationWidth: 172,
  illustrationHeight: 140,
  blockGap: 18,
  gridWidth: 331,
  gridRowGap: 18,
  tileWidth: 96,
  tileMinHeight: 94,
  tilePaddingH: 12,
  tilePaddingV: 16,
  tileGap: 8,
  tileRadius: 4,
  iconHeight: 40,
  ctaWidth: 307,
  ctaHeight: 40,
  ctaRadius: 82,
  ctaTopGap: 40,
  minTouchTarget: 44,
  stackedFontScale: 1.5,
  popupInsetReserve: 64,
} as const;

export const ctaGradient = {
  angleDeg: 133.8255,
  stops: [
    { offset: 0.055578, color: palette.ctaStart },
    { offset: 0.94442, color: palette.ctaEnd },
  ],
} as const;

/** Figma numbers for the FAQ screen (node 2:2068, 360 x 778 reference frame). */
export const faqLayout = {
  columnMaxWidth: 360,
  actionBarHeight: 48,
  backArrowLeft: 18,
  backArrowWidth: 21,
  backArrowHeight: 18,
  titleGap: 11,
  titleFontSize: 14,
  listTop: 12,
  listSide: 18,
  cardGap: 8,
  cardRadius: 4,
  cardPadding: 12,
  chevronSize: 20,
  chevronGap: 7,
  questionFontSize: 12,
  questionLineHeight: 18,
  answerGap: 8,
  answerBlockGap: 4,
  listMarkerWidth: 18,
  minTouchTarget: 44,
  chevronAnimationMs: 150,
} as const;
