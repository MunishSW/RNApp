import { setAnalyticsSink, track } from '../analytics';

afterEach(() => setAnalyticsSink(() => undefined));

describe('analytics', () => {
  // Covers: HOME_ACTION_TC_007 — cta_clicked payload shape
  it('[HOME_ACTION_TC_007] forwards typed events to the sink', () => {
    const sink = jest.fn();
    setAnalyticsSink(sink);
    track({ name: 'cta_clicked', properties: { cta_name: 'login', screen: 'non_logged_home' } });
    expect(sink).toHaveBeenCalledWith({
      name: 'cta_clicked',
      properties: { cta_name: 'login', screen: 'non_logged_home' },
    });
  });

  it('never throws when the sink throws', () => {
    setAnalyticsSink(() => {
      throw new Error('sdk down');
    });
    expect(() =>
      track({ name: 'contact_us_clicked', properties: { channel: 'non_logged_home' } }),
    ).not.toThrow();
  });
});
