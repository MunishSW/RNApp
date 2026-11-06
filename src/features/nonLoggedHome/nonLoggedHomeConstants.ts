/** Central label file for the Non-Logged-In Home page (BRD 7.7). All user-facing text lives here. */

export const HEADLINE_LINES = [
  'Login to download account statements,',
  'make payments, and manage your',
  'account, on the go!',
] as const;

export const HEADLINE = HEADLINE_LINES.join('\n');

export type QuickLinkId =
  | 'payNow'
  | 'ourProducts'
  | 'trackApplication'
  | 'faqs'
  | 'offers'
  | 'contactUs';

export interface QuickLinkConfig {
  id: QuickLinkId;
  label: string;
  /** analytics link_name; track_application is TBD in the BRD (O-03) so it is carried as designed */
  linkName: string;
  /** Figma label text width, so the label wraps exactly as designed */
  labelWidth: number;
  /** Figma icon width (height is 40, track application is 40.234) */
  iconWidth: number;
  iconHeight: number;
}

/** Fixed Figma order (BR-4). */
export const QUICK_LINKS: readonly QuickLinkConfig[] = [
  { id: 'payNow', label: 'Pay Now', linkName: 'pay_now', labelWidth: 63, iconWidth: 40, iconHeight: 40 },
  { id: 'ourProducts', label: 'Our Products', linkName: 'products', labelWidth: 74, iconWidth: 43.636, iconHeight: 40 },
  { id: 'trackApplication', label: 'Track Application', linkName: 'track_application', labelWidth: 63, iconWidth: 40, iconHeight: 40.234 },
  { id: 'faqs', label: 'FAQs', linkName: 'faq', labelWidth: 82, iconWidth: 39.767, iconHeight: 40 },
  { id: 'offers', label: 'Offers', linkName: 'offers', labelWidth: 63, iconWidth: 42.222, iconHeight: 40 },
  { id: 'contactUs', label: 'Contact Us', linkName: 'contact_us', labelWidth: 63, iconWidth: 42.609, iconHeight: 40 },
];

export const LOGIN_LABEL = 'Login';

export const PAY_NOW_TITLE = 'Pay Now';
export const PAY_NOW_PATH = '/#/payments/paynow';

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
    { id: 'call', title: 'Call Us', subtitle: '022-45297300', url: 'tel:02245297300' },
    { id: 'email', title: 'Email Us', subtitle: 'bhflwecare@bajajhousing.co.in', url: 'mailto:bhflwecare@bajajhousing.co.in' },
    { id: 'find', title: 'Find Us', subtitle: 'Branch locator', url: null },
  ],
} as const;

export const LOADING_LABEL = 'Loading';

export const NON_LOGGED_HOME_LOCATION = 'non_logged_home';
export const FAQ_ERROR_DIALOG_NAME = 'faq_error';

export const A11Y = {
  illustrationHidden: true,
} as const;
