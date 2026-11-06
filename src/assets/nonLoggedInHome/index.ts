import { ImageSourcePropType } from 'react-native';

/** Assets exported from the Figma frame BHFL_prelogin (illustration, six tile icons). */
export const nonLoggedInHomeAssets = {
  illustration: require('./illustration.png') as ImageSourcePropType,
  payNow: require('./pay-now.png') as ImageSourcePropType,
  ourProducts: require('./our-products.png') as ImageSourcePropType,
  trackApplication: require('./track-application.png') as ImageSourcePropType,
  faqs: require('./faqs.png') as ImageSourcePropType,
  offers: require('./offers.png') as ImageSourcePropType,
  contactUs: require('./contact-us.png') as ImageSourcePropType,
} as const;

export type NonLoggedInHomeAssetKey = keyof typeof nonLoggedInHomeAssets;
