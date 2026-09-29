import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Feedback';
import { GridIcon, LogOutIcon } from '../components/icons';
import { errorMessage, toIsoDate } from '../utils';
import { useI18n } from '../i18n';

/**
 * Account overview.
 *
 * The update endpoint writes every profile column it accepts, so the form
 * always submits the full set (birth date and country included) rather than
 * only the fields the user touched — otherwise saving would blank them out.
 */
export default function Profile() {
  const { user, logout, updateUser, isAdmin } = useAuth();
  const { t, date } = useI18n();
  const navigate = useNavigate();
  const userId = user?.id_usuario;

  const [form, setForm] = useState({
    nombre: user?.nombre ?? '',
    email: user?.email ?? '',
    fecha_nacimiento: '',
    pais: ''
  });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;

    api
      .get(`/users/${userId}`)
      .then(({ data }) => {
        if (!alive) return;
        setForm({
          nombre: data.nombre ?? '',
          email: data.email ?? '',
          fecha_nacimiento: toIsoDate(data.fecha_nacimiento),
          pais: data.pais ?? ''
        });
      })
      .catch(() => {
        // Non-fatal: fall back to whatever the session already told us.
      });

    api
      .get('/playlists')
      .then(({ data }) =>
        alive &&
        setStats({
          playlists: data.length,
          canciones: data.reduce((sum, p) => sum + (p.total_canciones ?? 0), 0)
        })
      )
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [userId]);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setNotice(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await api.put(`/users/${userId}`, {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        fecha_nacimiento: form.fecha_nacimiento || null,
        pais: form.pais.trim() || null
      });
      updateUser({ ...user, nombre: form.nombre, email: form.email });
      setEditing(false);
      setNotice({ type: 'success', text: t('profile.saved') });
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, t, t('profile.saveError')) });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = (user?.nombre ?? '?').trim().charAt(0).toUpperCase();

  return (
    <div className="page">
      <div className="profile-head">
        <div
          className="profile-avatar"
          style={{
            display: 'grid',
            placeItems: 'center',
            background: 'var(--cover-0)'
          }}
        >
          <span style={{ fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,.9)' }}>
            {initials}
          </span>
        </div>
        <div>
          <h1 className="profile-name">{user?.nombre}</h1>
          <p className="hero-sub" style={{ marginTop: 12 }}>
            <span>{user?.email}</span>
            <span className="dot">•</span>
            <span>{isAdmin ? t('profile.admin') : t('profile.user')}</span>
          </p>
          {user?.fecha_registro && (
            <p className="hero-note" style={{ marginTop: 6 }}>
              {t('profile.memberSince', { date: date(user.fecha_registro) })}
            </p>
          )}
        </div>
      </div>

      {notice && (
        <div style={{ marginBottom: 16 }}>
          <Alert variant={notice.type} onDismiss={() => setNotice(null)}>
            {notice.text}
          </Alert>
        </div>
      )}

      <div className="detail-grid">
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">{t('profile.accountInfo')}</h2>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? t('common.cancel') : t('common.edit')}
            </button>
          </div>

          {editing ? (
            <form className="stack" onSubmit={save}>
              <label className="field">
                <span className="field-label">{t('profile.name')}</span>
                <input
                  className="input"
                  value={form.nombre}
                  onChange={update('nombre')}
                  maxLength={100}
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">{t('profile.email')}</span>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">{t('profile.birthDate')}</span>
                <input
                  className="input"
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={update('fecha_nacimiento')}
                />
              </label>

              <label className="field">
                <span className="field-label">{t('profile.country')}</span>
                <input
                  className="input"
                  value={form.pais}
                  onChange={update('pais')}
                  placeholder={t('profile.countryPlaceholder')}
                  maxLength={60}
                />
              </label>

              <div>
                <button type="submit" className="btn btn--primary" disabled={busy}>
                  {busy ? t('common.saving') : t('profile.saveChanges')}
                </button>
              </div>
            </form>
          ) : (
            <dl className="definition-list">
              <dt>{t('profile.name')}</dt>
              <dd>{form.nombre || '—'}</dd>
              <dt>{t('profile.email')}</dt>
              <dd>{form.email || '—'}</dd>
              <dt>{t('profile.accountType')}</dt>
              <dd>{isAdmin ? t('role.admin') : t('role.user')}</dd>
              <dt>{t('profile.birthDate')}</dt>
              <dd>{form.fecha_nacimiento ? date(form.fecha_nacimiento) : '—'}</dd>
              <dt>{t('profile.country')}</dt>
              <dd>{form.pais || '—'}</dd>
              <dt>{t('profile.sinceLabel')}</dt>
              <dd>
                {user?.fecha_registro
                  ? t('profile.memberSince', { date: date(user.fecha_registro) })
                  : '—'}
              </dd>
            </dl>
          )}
        </div>

        <div className="stack">
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat">
              <div className="stat-label">{t('profile.playlists')}</div>
              <div className="stat-value">{stats ? stats.playlists : '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">{t('profile.savedSongs')}</div>
              <div className="stat-value">{stats ? stats.canciones : '—'}</div>
            </div>
          </div>

          {isAdmin && (
            <Link className="btn btn--ghost btn--block" to="/admin">
              <GridIcon size={16} /> {t('nav.adminPanel')}
            </Link>
          )}

          <button type="button" className="btn btn--danger btn--block" onClick={handleLogout}>
            <LogOutIcon size={16} /> {t('nav.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
