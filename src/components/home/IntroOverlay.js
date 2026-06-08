import './IntroOverlay.css';

function IntroOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div className="intro-overlay" aria-hidden="true">
      <div className="intro-icon">EAS</div>
    </div>
  );
}

export default IntroOverlay;
