import './AppWindBackground.css';

const PETAL_COUNT = 10;
const WIND_STREAK_LANES = 5;

const BG_SLIDES = [
  'https://images.template.net/222766/darkness-background-edit-online.jpg',
  'https://www.wherewindsmeetgame.com/pc/gw/20251024112521/img/9_d298dbdf.jpg?image_process=format,jpg',
  'https://picfiles.alphacoders.com/657/657077.jpg',
  "https://wallpapercave.com/wp/wp12049483.jpg",
  'https://wallpaperaccess.com/full/23988405.jpg',
  "https://www.wherewindsmeetgame.com/pc/gw/20251024112521/img/22_94a1bd9c.jpg?image_process=format,jpg",
  'https://wallpapercat.com/w/full/0/b/8/126283-3332x1874-desktop-hd-game-of-thrones-wallpaper-photo.jpg',
];

/** На мобильных — кадр с левого края */
const MOBILE_LEFT_ALIGN_SLIDES = new Set([
  'https://wallpaperaccess.com/full/23988405.jpg',
  "https://www.wherewindsmeetgame.com/pc/gw/20251024112521/img/22_94a1bd9c.jpg?image_process=format,jpg",

  'https://wallpapercat.com/w/full/0/b/8/126283-3332x1874-desktop-hd-game-of-thrones-wallpaper-photo.jpg',
]);

/** На мобильных — правая часть картинки по центру экрана */
const MOBILE_RIGHT_ALIGN_SLIDES = new Set([
  'https://wallpapercave.com/wp/wp12049483.jpg',
]);

function getSlideClassName(src) {
  if (MOBILE_LEFT_ALIGN_SLIDES.has(src)) return 'app-wind-bg-slide app-wind-bg-slide--mobile-left';
  if (MOBILE_RIGHT_ALIGN_SLIDES.has(src)) return 'app-wind-bg-slide app-wind-bg-slide--mobile-right';
  return 'app-wind-bg-slide';
}

const SLIDE_INTERVAL_S = 8;
const SLIDE_COUNT = BG_SLIDES.length;
const SLIDE_CYCLE_S = SLIDE_COUNT * SLIDE_INTERVAL_S;
const SLOT_PERCENT = 100 / SLIDE_COUNT;
const FADE_PERCENT = SLOT_PERCENT * 0.25;
const FADE_IN_END = FADE_PERCENT;
const HOLD_END = SLOT_PERCENT + FADE_PERCENT;
const FADE_OUT_END = SLOT_PERCENT + FADE_PERCENT * 2;

const SLIDE_FADE_KEYFRAMES = `
  @keyframes wind-bg-slide-fade {
    0% { opacity: 0; }
    ${FADE_IN_END}% { opacity: 1; }
    ${HOLD_END}% { opacity: 1; }
    ${FADE_OUT_END}% { opacity: 0; }
    100% { opacity: 0; }
  }
`;

function AppWindBackground() {
  return (
    <div className="app-wind-bg" aria-hidden="true">
      <style>{SLIDE_FADE_KEYFRAMES}</style>
      <div
        className="app-wind-bg-slides"
        style={{
          '--slide-count': SLIDE_COUNT,
          '--slide-cycle': `${SLIDE_CYCLE_S}s`,
        }}
      >
        {BG_SLIDES.map((src, index) => (
          <div
            key={src}
            className={getSlideClassName(src)}
            style={{
              backgroundImage: `url("${src}")`,
              '--slide-delay': `${index * SLIDE_INTERVAL_S}s`,
            }}
          />
        ))}
      </div>
      <div className="app-wind-bg-mist" />
      <div className="app-wind-bg-streaks">
        {Array.from({ length: WIND_STREAK_LANES }, (_, index) => (
          <span
            key={index}
            className={`wind-streak wind-streak--${index + 1}`}
          />
        ))}
      </div>
      <div className="app-wind-bg-petals">
        {Array.from({ length: PETAL_COUNT }, (_, index) => (
          <span key={index} className={`wind-petal wind-petal--${index + 1}`} />
        ))}
      </div>
    </div>
  );
}

export default AppWindBackground;
