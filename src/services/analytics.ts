/** Typed analytics events for the Non-Logged-In Home page (BRD 4.2.9, 4.3.9). No personal data. */

export type AnalyticsEvent =
  | {
      name: 'quick_link_clicked';
      properties: { link_name: string; location: 'non_logged_home'; logged_in: false };
    }
  | { name: 'contact_us_clicked'; properties: { channel: 'non_logged_home' } }
  | {
      name: 'cta_clicked';
      properties: { cta_name: 'login'; screen: 'non_logged_home' };
    }
  | {
      name: 'dialog_shown';
      properties: { dialog_name: string; screen: 'non_logged_home'; kind: 'error' };
    };

export type AnalyticsSink = (event: AnalyticsEvent) => void;

/** No SDK is declared in the project yet, so events go to a replaceable sink. */
let sink: AnalyticsSink = () => undefined;

export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

export function track(event: AnalyticsEvent): void {
  try {
    sink(event);
  } catch {
    // Analytics never breaks the user flow.
  }
}
