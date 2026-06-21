import { parseYoutubeStartSeconds } from './parseYoutubeStartSeconds';

describe('parseYoutubeStartSeconds', () => {
  it('returns 0 when no start time is present', () => {
    expect(parseYoutubeStartSeconds('https://www.youtube.com/watch?v=mL7LiSAIIwI')).toBe(0);
  });

  it('parses t=1s from youtube url', () => {
    expect(parseYoutubeStartSeconds('https://www.youtube.com/watch?v=mL7LiSAIIwI&t=1s')).toBe(1);
  });

  it('parses start query param', () => {
    expect(parseYoutubeStartSeconds('https://www.youtube.com/watch?v=mL7LiSAIIwI&start=42')).toBe(42);
  });
});
