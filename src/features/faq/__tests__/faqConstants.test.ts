import * as c from '../faqConstants';

describe('faqConstants', () => {
  it('holds every on-screen string exactly as the spec quotes it', () => {
    expect(c.FAQ_TITLE).toBe('FAQs');
    expect(c.BACK_LABEL).toBe('Back');
    expect(c.EMPTY_MESSAGE).toBe('No FAQs are available right now.');
    expect(c.ERROR_MESSAGE).toBe(
      'Your request could not be processed at this moment. Request you to try again after sometime.',
    );
    expect(c.RETRY_LABEL).toBe('Retry');
    expect(c.LOADING_LABEL).toBe('Loading');
    expect(c.STATE_EXPANDED).toBe('Expanded');
    expect(c.STATE_COLLAPSED).toBe('Collapsed');
    expect(c.LIST_BULLET).toBe('•');
  });
});
