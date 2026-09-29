import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';
import Modal from '../../components/Modal';
import { Alert, EmptyState, Spinner } from '../../components/Feedback';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, AlbumIcon } from '../../components/icons';
import { errorMessage, toIsoDate } from '../../utils';

const EMPTY = {
  titulo: '',
  id_artista: '',
  fecha_lanzamiento: '',
  genero: '',
  portada: ''
};

/** Full CRUD over the `album` table, including cover upload. */
export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, ar] = await Promise.all([api.get('/albums'), api.get('/artists')]);
      setAlbums(a.data);
      setArtists(ar.data);
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar los álbumes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return albums;
    return albums.filter(
      (a) =>
        a.titulo.toLowerCase().includes(term) ||
        (a.nombre_artista ?? '').toLowerCase().includes(term) ||
        (a.genero ?? '').toLowerCase().includes(term)
    );
  }, [albums, query]);

  const remove = async (album) => {
    if (!window.confirm(`¿Eliminar el álbum «${album.titulo}»?`)) return;
    try {
      await api.delete(`/albums/${album.id_album}`);
      setNotice({ type: 'success', text: 'Álbum eliminado.' });
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
          <h2 className="section-title">Álbumes ({albums.length})</h2>
          <p className="text-subdued" style={{ fontSize: 14 }}>
            {albums.filter((a) => a.portada).length} con portada
          </p>
        </div>
        <div className="row">
          <div className="input-group" style={{ flex: '0 1 260px' }}>
            <SearchIcon size={18} />
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar álbumes"
              aria-label="Filtrar álbumes"
            />
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setEditing({ ...EMPTY })}
          >
            <PlusIcon size={16} /> Nuevo álbum
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
          <EmptyState icon={AlbumIcon} title="Sin álbumes" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>Título</th>
                  <th>Artista</th>
                  <th>Género</th>
                  <th>Fecha</th>
                  <th className="num">Canciones</th>
                  <th>Portada</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((album) => (
                  <tr key={album.id_album}>
                    <td className="num">{album.id_album}</td>
                    <td className="cell-title">{album.titulo}</td>
                    <td className="text-subdued">{album.nombre_artista ?? '—'}</td>
                    <td className="text-subdued">{album.genero ?? '—'}</td>
                    <td className="text-subdued">
                      {album.fecha_lanzamiento ? album.fecha_lanzamiento.slice(0, 10) : '—'}
                    </td>
                    <td className="num">{album.total_canciones ?? 0}</td>
                    <td>
                      {album.portada ? (
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
                          onClick={() => setEditing(album)}
                          aria-label={`Editar ${album.titulo}`}
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => remove(album)}
                          aria-label={`Eliminar ${album.titulo}`}
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
        <AlbumModal
          album={editing}
          artists={artists}
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

function AlbumModal({ album, artists, onClose, onSaved }) {
  const isNew = !album.id_album;
  const [form, setForm] = useState({
    titulo: album.titulo ?? '',
    id_artista: album.id_artista ?? '',
    fecha_lanzamiento: toIsoDate(album.fecha_lanzamiento),
    genero: album.genero ?? '',
    portada: album.portada ?? ''
  });
  const [coverFile, setCoverFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (!form.id_artista) {
      setError('Selecciona un artista.');
      return;
    }

    setBusy(true);
    try {
      let portada = form.portada;
      if (coverFile) {
        const fd = new FormData();
        fd.append('image', coverFile);
        const { data } = await api.post('/upload/image?type=images', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        portada = data.filename;
      }

      const payload = {
        titulo: form.titulo.trim(),
        id_artista: Number(form.id_artista),
        fecha_lanzamiento: form.fecha_lanzamiento || null,
        genero: form.genero.trim(),
        portada: portada || null
      };

      if (isNew) {
        await api.post('/albums', payload);
        onSaved('Álbum creado.');
      } else {
        await api.put(`/albums/${album.id_album}`, payload);
        onSaved('Álbum actualizado.');
      }
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar el álbum.'));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isNew ? 'Nuevo álbum' : `Editar «${album.titulo}»`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="album-form" className="btn btn--primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="album-form" className="stack" onSubmit={submit}>
        {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

        <label className="field">
          <span className="field-label">Título</span>
          <input
            className="input"
            value={form.titulo}
            onChange={update('titulo')}
            maxLength={255}
            required
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Artista</span>
            <select
              className="input"
              value={form.id_artista}
              onChange={update('id_artista')}
              required
            >
              <option value="">Selecciona…</option>
              {artists.map((a) => (
                <option key={a.id_artista} value={a.id_artista}>
                  {a.nombre_artista}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Género</span>
            <input
              className="input"
              value={form.genero}
              onChange={update('genero')}
              maxLength={100}
              placeholder="Indie rock"
            />
          </label>

          <label className="field">
            <span className="field-label">Fecha de lanzamiento</span>
            <input
              className="input"
              type="date"
              value={form.fecha_lanzamiento}
              onChange={update('fecha_lanzamiento')}
            />
          </label>
        </div>

        <div className="field">
          <span className="field-label">Portada</span>
          {album.portada && !coverFile && (
            <img
              src={`/uploads/images/${album.portada}`}
              alt="Portada actual"
              style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <input
            className="input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            style={{ paddingTop: 8 }}
          />
          <span className="field-hint">JPG, PNG, GIF o WEBP. Máximo 10 MB.</span>
        </div>
      </form>
    </Modal>
  );
}
