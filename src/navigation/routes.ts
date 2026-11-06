/** Route names and params. Destination screens other than Home are stubs here (their own modules own them). */

export const ROUTES = {
  NonLoggedHome: 'NonLoggedHome',
  LoginScreen: 'LoginScreen',
  Products: 'Products',
  Offers: 'Offers',
  Faq: 'Faq',
  PayNowWebView: 'PayNowWebView',
  TrackApplication: 'TrackApplication',
  BranchLocator: 'BranchLocator',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export interface PayNowParams {
  title: string;
  /** Portal URL from build config; null when not configured (handled without a crash) */
  url: string | null;
  loader: boolean;
}

export type RootStackParamList = {
  NonLoggedHome: undefined;
  LoginScreen: undefined;
  Products: undefined;
  Offers: undefined;
  Faq: undefined;
  PayNowWebView: PayNowParams;
  TrackApplication: undefined;
  BranchLocator: undefined;
};
