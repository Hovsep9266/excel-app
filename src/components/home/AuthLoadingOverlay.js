import './AuthLoadingOverlay.css';

function AuthLoadingOverlay({ visible, loadingText }) {
  if (!visible) return null;
  return (
    <div className="fullscreen-loader">
      <div className="loader-spinner" />
      <p className="loader-text">{loadingText}</p>
    </div>
  );
}

export default AuthLoadingOverlay;
