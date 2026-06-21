import { parseYoutubeId } from '../utils/parseYoutubeId';
import { parseYoutubeStartSeconds } from '../utils/parseYoutubeStartSeconds';

const DEFAULT_MENU_VIDEO_YOUTUBE_URL = 'https://www.youtube.com/watch?v=mL7LiSAIIwI&t=1s';

function normalizePublicPath(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function getMenuVideoConfig() {
  const youtubeSource =
    process.env.REACT_APP_MENU_VIDEO_YOUTUBE_URL ||
    process.env.REACT_APP_MENU_VIDEO_URL ||
    DEFAULT_MENU_VIDEO_YOUTUBE_URL;
  const fileSrc = normalizePublicPath(process.env.REACT_APP_MENU_VIDEO_FILE || '');
  const youtubeId = parseYoutubeId(youtubeSource);
  const startSeconds = parseYoutubeStartSeconds(youtubeSource);

  return {
    hasVideo: Boolean(youtubeId || fileSrc),
    youtubeId,
    fileSrc,
    startSeconds,
  };
}
