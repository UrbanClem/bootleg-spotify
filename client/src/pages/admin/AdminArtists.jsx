import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';
import Modal from '../../components/Modal';
import { Alert, EmptyState, Spinner } from '../../components/Feedback';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, ArtistIcon } from '../../components/icons';
import { errorMessage, toIsoDate } from '../../utils';

const EMPTY = {
  nombre_artista: '',
  biografia: '',
  seguidores: 0,
  fecha_registro: '',
  verificado: false,
  foto_perfil: ''
};

/** Full CRUD over the `artista` table, including profile photo upload. */
export default function AdminArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/artists');
      setArtists(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar los artistas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return artists;
    return artists.filter(
      (a) =>
        a.nombre_artista.toLowerCase().includes(term) ||
        (a.biografia ?? '').toLowerCase().includes(term)
    );
  }, [artists, query]);

  const remove = async (artist) => {
    if (!window.confirm(`¿Eliminar al artista «${artist.nombre_artista}»?`)) return;
    try {
      await api.delete(`/artists/${artist.id_artista}`);
      setNotice({ type: 'success', text: 'Artista eliminado.' });
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
          <h2 className="section-title">Artistas ({artists.length})</h2>
          <p className="text-subdued" style={{ fontSize: 14 }}>
            {artists.filter((a) => a.verificado).length} verificados
          </p>
        </div>
        <div className="row">
          <div className="input-group" style={{ flex: '0 1 260px' }}>
            <SearchIcon size={18} />
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar artistas"
              aria-label="Filtrar artistas"
            />
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setEditing({ ...EMPTY })}
          >
            <PlusIcon size={16} /> Nuevo artista
          </button>
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
          <EmptyState icon={ArtistIcon} title="Sin artistas" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>Nombre</th>
                  <th className="num">Canciones</th>
                  <th className="num">Seguidores</th>
                  <th>Verificado</th>
                  <th>Foto</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((artist) => (
                  <tr key={artist.id_artista}>
                    <td className="num">{artist.id_artista}</td>
                    <td className="cell-title">{artist.nombre_artista}</td>
                    <td className="num">{artist.total_canciones ?? 0}</td>
                    <td className="num">{(artist.seguidores ?? 0).toLocaleString('es-ES')}</td>
                    <td>
                      {artist.verificado ? (
                        <span className="tag tag--green">Sí</span>
                      ) : (
                        <span className="tag">No</span>
                      )}
                    </td>
                    <td>
                      {artist.foto_perfil ? (
                        <span className="tag tag--green">Sí</span>
                      ) : (
                        <span className="tag">No</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => setEditing(artist)}
                          aria-label={`Editar ${artist.nombre_artista}`}
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => remove(artist)}
                          aria-label={`Eliminar ${artist.nombre_artista}`}
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
        <ArtistModal
          artist={editing}
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

function ArtistModal({ artist, onClose, onSaved }) {
  const isNew = !artist.id_artista;
  const [form, setForm] = useState({
    nombre_artista: artist.nombre_artista ?? '',
    biografia: artist.biografia ?? '',
    seguidores: artist.seguidores ?? 0,
    fecha_registro: toIsoDate(artist.fecha_registro),
    verificado: Boolean(artist.verificado),
    foto_perfil: artist.foto_perfil ?? ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nombre_artista.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setBusy(true);
    try {
      let foto = form.foto_perfil;
      if (photoFile) {
        const fd = new FormData();
        fd.append('image', photoFile);
        const { data } = await api.post('/upload/image?type=artists', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        foto = data.filename;
      }

      const payload = {
        nombre_artista: form.nombre_artista.trim(),
        biografia: form.biografia,
        seguidores: Number(form.seguidores) || 0,
        fecha_registro: form.fecha_registro || null,
        verificado: form.verificado ? 1 : 0,
        foto_perfil: foto || null
      };

      if (isNew) {
        await api.post('/artists', payload);
        onSaved('Artista creado.');
      } else {
        await api.put(`/artists/${artist.id_artista}`, payload);
        onSaved('Artista actualizado.');
      }
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar el artista.'));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isNew ? 'Nuevo artista' : `Editar «${artist.nombre_artista}»`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="artist-form" className="btn btn--primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="artist-form" className="stack" onSubmit={submit}>
        {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

        <label className="field">
          <span className="field-label">Nombre artístico</span>
          <input
            className="input"
            value={form.nombre_artista}
            onChange={update('nombre_artista')}
            maxLength={100}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Biografía</span>
          <textarea
            className="input"
            value={form.biografia}
            onChange={update('biografia')}
            rows={4}
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Seguidores</span>
            <input
              className="input"
              type="number"
              min="0"
              value={form.seguidores}
              onChange={update('seguidores')}
            />
          </label>

          <label className="field">
            <span className="field-label">Fecha de registro</span>
            <input
              className="input"
              type="date"
              value={form.fecha_registro}
              onChange={update('fecha_registro')}
            />
          </label>
        </div>

        <label className="switch">
          <input type="checkbox" checked={form.verificado} onChange={update('verificado')} />
          <span className="switch-track" />
          <span>Artista verificado</span>
        </label>

        <div className="field">
          <span className="field-label">Foto de perfil</span>
          {artist.foto_perfil && !photoFile && (
            <img
              src={`/uploads/artists/${artist.foto_perfil}`}
              alt="Foto actual"
              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }}
            />
          )}
          <input
            className="input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            style={{ paddingTop: 8 }}
          />
        </div>
      </form>
    </Modal>
  );
}
