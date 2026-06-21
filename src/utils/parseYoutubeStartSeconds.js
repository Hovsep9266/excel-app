export function parseYoutubeStartSeconds(value) {
  const input = String(value || '').trim();
  if (!input) return 0;

  const timeMatch = input.match(/[?&]t=(\d+)s?/i);
  if (timeMatch?.[1]) return Number(timeMatch[1]);

  const startMatch = input.match(/[?&]start=(\d+)/i);
  if (startMatch?.[1]) return Number(startMatch[1]);

  return 0;
}
