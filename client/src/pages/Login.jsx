import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Alert } from '../components/Feedback';
import { UserIcon, CloseIcon } from '../components/icons';
import LanguageSwitch from '../components/LanguageSwitch';
import { useI18n } from '../i18n';
import { errorMessage } from '../utils';

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from ?? '/';

  useEffect(() => {
    setError('');
  }, [email, password]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err, t, t('auth.failed')));
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand">
          <Logo size={32} />
          Bootleg
        </div>

        <h1 className="auth-title">{t('auth.signIn')}</h1>
        <p className="auth-sub">{t('auth.signInTagline')}</p>

        <form className="auth-form" onSubmit={submit}>
          {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

          <label className="field">
            <span className="field-label">{t('auth.email')}</span>
            <div className="input-group">
              <UserIcon size={20} />
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="field">
            <span className="field-label">{t('auth.password')}</span>
            <div className="input-group">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="input-clear"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? t('auth.hidePassword') : t('auth.showPassword')
                }
              >
                {showPassword ? <CloseIcon size={18} /> : <UserIcon size={18} />}
              </button>
            </div>
          </label>

          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
            {busy ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <hr className="auth-divider" />

        <p className="auth-alt">
          {t('auth.noAccount')}{' '}
          <Link to="/register">{t('auth.registerCta')}</Link>
        </p>

        <div className="auth-demo">
          <strong>{t('auth.demoAccount')}</strong>
          <br />
          <code>test@email.com</code> · <code>123456</code>
        </div>

        <div className="auth-lang">
          <LanguageSwitch />
        </div>
      </div>
    </div>
  );
}
