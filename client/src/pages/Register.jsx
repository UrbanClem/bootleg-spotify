import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Alert } from '../components/Feedback';
import { UserIcon, CheckIcon, CloseIcon } from '../components/icons';

/** Rough password strength meter, mirroring Spotify's signup hints. */
function strengthOf(password) {
  if (!password) return 0;
  if (password.length < 6) return 1;
  if (password.length < 10) return /[0-9]/.test(password) ? 3 : 2;
  return /[0-9]/.test(password) && /[A-Za-z]/.test(password) ? 4 : 3;
}

const STRENGTH = ['', 'Débil', 'Normal', 'Buena', 'Fuerte'];

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError('');
  };

  const strength = strengthOf(form.password);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await register(form.nombre.trim(), form.email.trim(), form.password);
      // Sign in straight away so the new user lands in the app.
      await login(form.email.trim(), form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.error ?? 'No pudimos crear la cuenta. Inténtalo de nuevo.'
      );
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

        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-sub">Empieza a escuchar en segundos.</p>

        <form className="auth-form" onSubmit={submit}>
          {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

          <label className="field">
            <span className="field-label">Nombre</span>
            <div className="input-group">
              <UserIcon size={20} />
              <input
                className="input"
                value={form.nombre}
                onChange={update('nombre')}
                placeholder="Tu nombre"
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>
          </label>

          <label className="field">
            <span className="field-label">Correo</span>
            <div className="input-group">
              <UserIcon size={20} />
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="tu@correo.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="field">
            <span className="field-label">Contraseña</span>
            <div className="input-group">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="input-clear"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <CloseIcon size={18} /> : <CheckIcon size={18} />}
              </button>
            </div>
            {form.password && (
              <div className="strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={strength >= i ? `is-on level-${strength}` : ''} />
                  ))}
                </div>
                <span className="field-hint">{STRENGTH[strength]}</span>
              </div>
            )}
          </label>

          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
            {busy ? 'Creando cuenta…' : 'Registrarse'}
          </button>
        </form>

        <hr className="auth-divider" />

        <p className="auth-alt">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
