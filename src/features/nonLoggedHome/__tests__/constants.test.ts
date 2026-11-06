import {
  CONTACT_POPUP,
  EXIT_CONFIRM_MESSAGE,
  HEADLINE,
  HEADLINE_LINES,
  QUICK_LINKS,
  SERVER_ERROR_MESSAGE,
} from '../nonLoggedHomeConstants';

describe('nonLoggedHomeConstants', () => {
  // Covers: HOME_LAYOUT_TC_002 — tile labels and order
  it('[HOME_LAYOUT_TC_002] keeps the six labels in the fixed Figma order', () => {
    expect(QUICK_LINKS.map(q => q.label)).toEqual([
      'Pay Now',
      'Our Products',
      'Track Application',
      'FAQs',
      'Offers',
      'Contact Us',
    ]);
  });

  // Covers: HOME_LAYOUT_TC_001 — headline has three forced line breaks
  it('[HOME_LAYOUT_TC_001] headline has exactly three lines', () => {
    expect(HEADLINE_LINES).toHaveLength(3);
    expect(HEADLINE.split('\n')).toEqual([
      'Login to download account statements,',
      'make payments, and manage your',
      'account, on the go!',
    ]);
  });

  // Covers: HOME_CONTACT_TC_001 — popup heading and three rows
  it('[HOME_CONTACT_TC_001] popup text matches the BRD', () => {
    expect(CONTACT_POPUP.heading).toBe('We are here to help!');
    expect(CONTACT_POPUP.rows.map(r => [r.title, r.subtitle])).toEqual([
      ['Call Us', '022-45297300'],
      ['Email Us', 'bhflwecare@bajajhousing.co.in'],
      ['Find Us', 'Branch locator'],
    ]);
  });

  // Covers: HOME_NEG_TC_001 — exact FAQ error message
  it('[HOME_NEG_TC_001] error and exit texts are verbatim', () => {
    expect(SERVER_ERROR_MESSAGE).toBe(
      'Your request could not be processed at this moment. Request you to try again after sometime.',
    );
    expect(EXIT_CONFIRM_MESSAGE).toBe('Are you sure you want to exit!');
  });
});
