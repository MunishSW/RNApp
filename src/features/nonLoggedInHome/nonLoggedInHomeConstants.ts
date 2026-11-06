import { ROUTES, RouteName } from '../../navigation/routes';

/** Central label file for the Non-Logged-In Home page (spec 002, BRD 7.7). All user-facing text lives here. */

export const HEADLINE_LINES = [
  'Login to download account statements,',
  'make payments, and manage your',
  'account, on the go!',
] as const;

/** Explicit line breaks keep the approved three-line look at default text size (FR-4.1-03). */
export const HEADLINE = HEADLINE_LINES.join('\n');

export type TileId =
  | 'payNow'
  | 'ourProducts'
  | 'trackApplication'
  | 'faqs'
  | 'offers'
  | 'contactUs';

export interface TileConfig {
  id: TileId;
  label: string;
  /** Analytics link_name for quick_link_clicked (FR-4.2-09) */
  linkName: string;
  /** Destination route; null when the tile does not navigate directly (FAQs flow, Contact Us popup) */
  route: RouteName | null;
  /** Figma label box width, so the label wraps exactly as designed */
  labelWidth: number;
  /** Figma icon size */
  iconWidth: number;
  iconHeight: number;
}

/** Fixed Figma order (FR-4.2-01, BR-4). */
export const TILES: readonly TileConfig[] = [
  { id: 'payNow', label: 'Pay Now', linkName: 'pay_now', route: ROUTES.NonLoggedInPayNow, labelWidth: 63, iconWidth: 40, iconHeight: 40 },
  { id: 'ourProducts', label: 'Our Products', linkName: 'products', route: ROUTES.Products, labelWidth: 74, iconWidth: 43.636, iconHeight: 40 },
  { id: 'trackApplication', label: 'Track Application', linkName: 'track_application', route: ROUTES.TrackApplication, labelWidth: 63, iconWidth: 40, iconHeight: 40.234 },
  { id: 'faqs', label: 'FAQs', linkName: 'faq', route: null, labelWidth: 82, iconWidth: 39.767, iconHeight: 40 },
  { id: 'offers', label: 'Offers', linkName: 'offers', route: ROUTES.Offers, labelWidth: 63, iconWidth: 42.222, iconHeight: 40 },
  { id: 'contactUs', label: 'Contact Us', linkName: 'contact_us', route: null, labelWidth: 63, iconWidth: 42.609, iconHeight: 40 },
];

export const LOGIN_LABEL = 'Login';

export const PAY_NOW_TITLE = 'Pay Now';
export const BACK_LABEL = 'Back';

export const SERVER_ERROR_MESSAGE =
  'Your request could not be processed at this moment. Request you to try again after sometime.';
export const OKAY_LABEL = 'Okay';
export const CANCEL_LABEL = 'CANCEL';

export const EXIT_CONFIRM_MESSAGE = 'Are you sure you want to exit!';

export const UPDATE_MESSAGE = 'Update your app to experience all the latest features.';
export const UPDATE_LABEL = 'Update';
export const EXIT_LABEL = 'Exit';
export const SKIP_LABEL = 'Skip';

export const CONTACT_POPUP = {
  heading: 'We are here to help!',
  closeLabel: 'Close',
  rows: [
    { id: 'call', title: 'Call Us', subtitle: '022-45297300' },
    { id: 'email', title: 'Email Us', subtitle: 'bhflwecare@bajajhousing.co.in' },
    { id: 'find', title: 'Find Us', subtitle: 'Branch locator' },
  ],
} as const;

export const LOADING_LABEL = 'Loading';

export const LOCATION = 'non_logged_home';
export const FAQ_ERROR_DIALOG_NAME = 'faq_error';
export const LOGIN_CTA_NAME = 'login';
