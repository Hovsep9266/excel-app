import '../../pages/home-common.css';
import './LoginFormCard.css';

function LoginFormCard({
  t,
  loginName,
  onLoginNameChange,
  loginPassword,
  onLoginPasswordChange,
  showPassword,
  onTogglePassword,
  onSubmit,
  authError,
}) {
  return (
    <section className="auth-card">
      <h1 className="app-title">{t('registrationTitle')}</h1>
      <p className="app-subtitle">{t('registrationSubtitle')}</p>
      <form className="auth-form" onSubmit={onSubmit}>
        <input
          type="text"
          value={loginName}
          onChange={(event) => onLoginNameChange(event.target.value)}
          placeholder={t('namePlaceholder')}
        />
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            value={loginPassword}
            onChange={(event) => onLoginPasswordChange(event.target.value)}
            placeholder={t('passwordPlaceholder')}
          />
          <button type="button" className="password-toggle-btn" onClick={onTogglePassword}>
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 25 25"
                width="25"
                height="25"
              >
                <path d="M23.312,9.733c-1.684-2.515-5.394-6.733-11.312-6.733S2.373,7.219,.688,9.733c-.922,1.377-.922,3.156,0,4.533,1.684,2.515,5.394,6.733,11.312,6.733s9.627-4.219,11.312-6.733c.922-1.377,.922-3.156,0-4.533Zm-.831,3.977c-1.573,2.349-5.027,6.29-10.48,6.29S3.093,16.059,1.52,13.71c-.696-1.039-.696-2.381,0-3.42,1.573-2.349,5.027-6.29,10.48-6.29s8.907,3.941,10.48,6.29c.696,1.039,.696,2.381,0,3.42ZM12,7c-2.757,0-5,2.243-5,5s2.243,5,5,5,5-2.243,5-5-2.243-5-5-5Zm0,9c-2.206,0-4-1.794-4-4s1.794-4,4-4,4,1.794,4,4-1.794,4-4,4Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 25 25" width="25" height="25">
                <path d="M23.271,9.419A15.866,15.866,0,0,0,19.9,5.51l2.8-2.8a1,1,0,0,0-1.414-1.414L18.241,4.345A12.054,12.054,0,0,0,12,2.655C5.809,2.655,2.281,6.893.729,9.419a4.908,4.908,0,0,0,0,5.162A15.866,15.866,0,0,0,4.1,18.49l-2.8,2.8a1,1,0,1,0,1.414,1.414l3.052-3.052A12.054,12.054,0,0,0,12,21.345c6.191,0,9.719-4.238,11.271-6.764A4.908,4.908,0,0,0,23.271,9.419ZM2.433,13.534a2.918,2.918,0,0,1,0-3.068C3.767,8.3,6.782,4.655,12,4.655A10.1,10.1,0,0,1,16.766,5.82L14.753,7.833a4.992,4.992,0,0,0-6.92,6.92l-2.31,2.31A13.723,13.723,0,0,1,2.433,13.534ZM15,12a3,3,0,0,1-3,3,2.951,2.951,0,0,1-1.285-.3L14.7,10.715A2.951,2.951,0,0,1,15,12ZM9,12a3,3,0,0,1,3-3,2.951,2.951,0,0,1,1.285.3L9.3,13.285A2.951,2.951,0,0,1,9,12Zm12.567,1.534C20.233,15.7,17.218,19.345,12,19.345A10.1,10.1,0,0,1,7.234,18.18l2.013-2.013a4.992,4.992,0,0,0,6.92-6.92l2.31-2.31a13.723,13.723,0,0,1,3.09,3.529A2.918,2.918,0,0,1,21.567,13.534Z" />
              </svg>
            )}
          </button>
        </div>
        <button className="auth-submit-btn" type="submit">
          {t('loginButton')}
        </button>
      </form>
      {authError ? <p className="auth-error">{authError}</p> : null}
    </section>
  );
}

export default LoginFormCard;
