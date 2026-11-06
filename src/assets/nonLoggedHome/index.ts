import { ImageSourcePropType } from 'react-native';

/** Assets exported from Figma node 2:937 (illustration 2:941, tile icons 2:947 to 2:964). */
export const nonLoggedHomeAssets = {
  illustration: require('./illustration.png') as ImageSourcePropType,
  payNow: require('./pay-now.png') as ImageSourcePropType,
  ourProducts: require('./our-products.png') as ImageSourcePropType,
  trackApplication: require('./track-application.png') as ImageSourcePropType,
  faqs: require('./faqs.png') as ImageSourcePropType,
  offers: require('./offers.png') as ImageSourcePropType,
  contactUs: require('./contact-us.png') as ImageSourcePropType,
} as const;

export type NonLoggedHomeAssetKey = keyof typeof nonLoggedHomeAssets;
