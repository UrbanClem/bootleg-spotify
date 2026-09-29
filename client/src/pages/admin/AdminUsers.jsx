import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';
import Modal from '../../components/Modal';
import { Alert, EmptyState, Spinner } from '../../components/Feedback';
import { EditIcon, TrashIcon, SearchIcon, UserIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, toIsoDate, formatDate } from '../../utils';

/**
 * User administration.
 *
 * The API exposes create (auth/register) and delete, plus a profile update
 * endpoint that any authenticated user may call on themselves. There is no
 * "change someone's role" route, so the role column is shown read-only rather
 * than offering a control that would silently do nothing.
 */
export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar los usuarios.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term) ||
        (u.pais ?? '').toLowerCase().includes(term)
    );
  }, [users, query]);

  const remove = async (target) => {
    if (target.id_usuario === me?.id_usuario) {
      setError('No puedes eliminar tu propia cuenta.');
      return;
    }
    if (!window.confirm(`¿Eliminar a «${target.nombre}»?`)) return;
    try {
      await api.delete(`/users/${target.id_usuario}`);
      setNotice({ type: 'success', text: 'Usuario eliminado.' });
      load();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo eliminar.'));
    }
  };

  if (loading) return <Spinner center />;

  return (
    <>
      <div className="admin-head">
        <div>
          <h2 className="section-title">Usuarios ({users.length})</h2>
        </div>
        <div className="row">
          <div className="input-group" style={{ flex: '0 1 260px' }}>
            <SearchIcon size={18} />
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar usuarios"
              aria-label="Filtrar usuarios"
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16 }}>
          <Alert onDismiss={() => setError('')}>{error}</Alert>
        </div>
      )}
      {notice && (
        <div style={{ marginTop: 16 }}>
          <Alert variant="success" onDismiss={() => setNotice(null)}>
            {notice.text}
          </Alert>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        {visible.length === 0 ? (
          <EmptyState icon={UserIcon} title="Sin usuarios" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Cuenta</th>
                  <th>País</th>
                  <th>Registro</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <tr key={u.id_usuario}>
                    <td className="num">{u.id_usuario}</td>
                    <td className="cell-title">
                      {u.nombre}
                      {u.id_usuario === me?.id_usuario && (
                        <span className="tag tag--green">Tú</span>
                      )}
                    </td>
                    <td className="text-subdued">{u.email}</td>
                    <td>
                      {u.tipo_cuenta === 'Admin' ? (
                        <span className="tag tag--green">Admin</span>
                      ) : (
                        <span className="tag">Premium</span>
                      )}
                    </td>
                    <td className="text-subdued">{u.pais ?? '—'}</td>
                    <td className="text-subdued">
                      {u.fecha_registro ? toIsoDate(u.fecha_registro) : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => setEditing(u)}
                          aria-label={`Editar ${u.nombre}`}
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className="toggle-btn"
                          disabled={u.id_usuario === me?.id_usuario}
                          onClick={() => remove(u)}
                          aria-label={`Eliminar ${u.nombre}`}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <UserModal
          target={editing}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            setNotice({ type: 'success', text: message });
            load();
          }}
        />
      )}
    </>
  );
}

function UserModal({ target, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: target.nombre ?? '',
    email: target.email ?? '',
    fecha_nacimiento: '',
    pais: target.pais ?? ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // The list endpoint omits the birth date, so fetch it before editing.
  useEffect(() => {
    let alive = true;
    api
      .get(`/users/${target.id_usuario}`)
      .then(({ data }) =>
        alive && setForm((f) => ({ ...f, fecha_nacimiento: toIsoDate(data.fecha_nacimiento) }))
      )
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [target.id_usuario]);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put(`/users/${target.id_usuario}`, {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        fecha_nacimiento: form.fecha_nacimiento || null,
        pais: form.pais.trim() || null
      });
      onSaved('Usuario actualizado.');
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar el usuario.'));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`Editar «${target.nombre}»`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="user-form" className="btn btn--primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="user-form" className="stack" onSubmit={submit}>
        {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

        <label className="field">
          <span className="field-label">Nombre</span>
          <input
            className="input"
            value={form.nombre}
            onChange={update('nombre')}
            maxLength={100}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Correo</span>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={update('email')}
            required
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Fecha de nacimiento</span>
            <input
              className="input"
              type="date"
              value={form.fecha_nacimiento}
              onChange={update('fecha_nacimiento')}
            />
          </label>

          <label className="field">
            <span className="field-label">País</span>
            <input
              className="input"
              value={form.pais}
              onChange={update('pais')}
              maxLength={60}
            />
          </label>
        </div>

        <p className="field-hint">
          Registrado el {formatDate(target.fecha_registro) || '—'}. El tipo de cuenta no
          se puede modificar desde aquí.
        </p>
      </form>
    </Modal>
  );
}
