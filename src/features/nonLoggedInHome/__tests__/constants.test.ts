import {
  CANCEL_LABEL,
  CONTACT_POPUP,
  EXIT_CONFIRM_MESSAGE,
  EXIT_LABEL,
  HEADLINE,
  HEADLINE_LINES,
  LOGIN_LABEL,
  OKAY_LABEL,
  PAY_NOW_TITLE,
  SERVER_ERROR_MESSAGE,
  SKIP_LABEL,
  TILES,
  UPDATE_LABEL,
  UPDATE_MESSAGE,
} from '../nonLoggedInHomeConstants';

describe('label file', () => {
  // Covers: FR-4.1-03, P-01, TC-102 - exact headline and its three lines
  it('[TC-102] keeps the exact headline on three lines', () => {
    expect(HEADLINE_LINES).toEqual([
      'Login to download account statements,',
      'make payments, and manage your',
      'account, on the go!',
    ]);
    expect(HEADLINE.split('\n')).toHaveLength(3);
    expect(HEADLINE.replace(/\n/g, ' ')).toBe(
      'Login to download account statements, make payments, and manage your account, on the go!',
    );
  });

  // Covers: FR-4.2-01, BR-4, TC-103 - tile order and labels
  it('[TC-103] lists six tiles in the fixed order with exact labels', () => {
    expect(TILES.map(t => t.label)).toEqual([
      'Pay Now',
      'Our Products',
      'Track Application',
      'FAQs',
      'Offers',
      'Contact Us',
    ]);
    expect(TILES.map(t => t.linkName)).toEqual([
      'pay_now',
      'products',
      'track_application',
      'faq',
      'offers',
      'contact_us',
    ]);
  });

  // Covers: FR-4.3-01, FR-4.3-05, TC-107, TC-108, TC-109 - single "Login", no Register Now, chatbot or accessibility entry
  it('[TC-107] has the "Login" label and no Register Now, chatbot or accessibility text', () => {
    expect(LOGIN_LABEL).toBe('Login');
    const all = JSON.stringify([
      HEADLINE,
      TILES,
      LOGIN_LABEL,
      CONTACT_POPUP,
      SERVER_ERROR_MESSAGE,
    ]).toLowerCase();
    expect(all).not.toContain('register');
    expect(all).not.toContain('chatbot');
    expect(all).not.toContain('accessibility');
  });

  // Covers: FR-4.5-06, FR-4.6-01, FR-4.7-xx, FR-4.8-xx - exact dialog and popup text
  it('keeps the exact popup, dialog and button text', () => {
    expect(CONTACT_POPUP.heading).toBe('We are here to help!');
    expect(CONTACT_POPUP.rows.map(r => [r.title, r.subtitle])).toEqual([
      ['Call Us', '022-45297300'],
      ['Email Us', 'bhflwecare@bajajhousing.co.in'],
      ['Find Us', 'Branch locator'],
    ]);
    expect(SERVER_ERROR_MESSAGE).toBe(
      'Your request could not be processed at this moment. Request you to try again after sometime.',
    );
    expect(OKAY_LABEL).toBe('Okay');
    expect(CANCEL_LABEL).toBe('CANCEL');
    expect(EXIT_CONFIRM_MESSAGE).toBe('Are you sure you want to exit!');
    expect(UPDATE_MESSAGE).toBe('Update your app to experience all the latest features.');
    expect([UPDATE_LABEL, EXIT_LABEL, SKIP_LABEL]).toEqual(['Update', 'Exit', 'Skip']);
    expect(PAY_NOW_TITLE).toBe('Pay Now');
  });
});
