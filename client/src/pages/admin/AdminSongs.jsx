import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';
import Modal from '../../components/Modal';
import { Alert, EmptyState, Spinner } from '../../components/Feedback';
import {
  PlusIcon, EditIcon, TrashIcon, SearchIcon, MusicIcon, PlayIcon
} from '../../components/icons';
import { errorMessage, formatDuration, toIsoDate } from '../../utils';

const EMPTY = {
  titulo: '',
  duracion: '',
  id_artista: '',
  id_album: '',
  fecha_lanzamiento: '',
  letra: '',
  explicit: false
};

/** Full CRUD over the `cancion` table, including audio upload. */
export default function AdminSongs() {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // {} => create, row => edit
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, al] = await Promise.all([
        api.get('/songs'),
        api.get('/artists'),
        api.get('/albums')
      ]);
      setSongs(s.data);
      setArtists(a.data);
      setAlbums(al.data);
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar las canciones.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return songs;
    return songs.filter(
      (s) =>
        s.titulo.toLowerCase().includes(term) ||
        (s.nombre_artista ?? '').toLowerCase().includes(term) ||
        (s.titulo_album ?? '').toLowerCase().includes(term)
    );
  }, [songs, query]);

  const remove = async (song) => {
    if (!window.confirm(`¿Eliminar «${song.titulo}»? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await api.delete(`/songs/${song.id_cancion}`);
      setNotice({ type: 'success', text: 'Canción eliminada.' });
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
          <h2 className="section-title">Canciones ({songs.length})</h2>
          <p className="text-subdued" style={{ fontSize: 14 }}>
            {songs.filter((s) => s.archivo_audio).length} con audio cargado
          </p>
        </div>
        <div className="row">
          <div className="input-group" style={{ flex: '0 1 260px' }}>
            <SearchIcon size={18} />
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar canciones"
              aria-label="Filtrar canciones"
            />
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setEditing({ ...EMPTY })}
          >
            <PlusIcon size={16} /> Nueva canción
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
          <EmptyState icon={MusicIcon} title="Sin canciones">
            Crea la primera para empezar el catálogo.
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>Título</th>
                  <th>Artista</th>
                  <th>Álbum</th>
                  <th className="num">Duración</th>
                  <th>Audio</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((song) => (
                  <tr key={song.id_cancion}>
                    <td className="num">{song.id_cancion}</td>
                    <td>
                      <div className="cell-title">
                        {song.explicit ? <span className="track-explicit">E</span> : null}
                        {song.titulo}
                      </div>
                    </td>
                    <td className="text-subdued">{song.nombre_artista ?? '—'}</td>
                    <td className="text-subdued">{song.titulo_album ?? '—'}</td>
                    <td className="num">{formatDuration(song.duracion)}</td>
                    <td>
                      {song.archivo_audio ? (
                        <a
                          className="tag tag--green"
                          href={`/uploads/audio/${song.archivo_audio}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <PlayIcon size={11} /> Listo
                        </a>
                      ) : (
                        <span className="tag tag--warning">Sin audio</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => setEditing(song)}
                          aria-label={`Editar ${song.titulo}`}
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => remove(song)}
                          aria-label={`Eliminar ${song.titulo}`}
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
        <SongModal
          song={editing}
          artists={artists}
          albums={albums}
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

function SongModal({ song, artists, albums, onClose, onSaved }) {
  const isNew = !song.id_cancion;
  const [form, setForm] = useState({
    titulo: song.titulo ?? '',
    duracion: song.duracion ?? '',
    id_artista: song.id_artista ?? '',
    id_album: song.id_album ?? '',
    fecha_lanzamiento: toIsoDate(song.fecha_lanzamiento),
    letra: song.letra ?? '',
    explicit: Boolean(song.explicit)
  });
  const [audioFile, setAudioFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
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
      // Upload audio first so the record can reference the stored filename.
      let archivo = song.archivo_audio ?? '';
      if (audioFile) {
        const fd = new FormData();
        fd.append('audio', audioFile);
        const { data } = await api.post('/upload/audio', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        archivo = data.filename;
      }

      const payload = {
        titulo: form.titulo.trim(),
        duracion: Number(form.duracion) || 0,
        id_artista: Number(form.id_artista),
        id_album: form.id_album ? Number(form.id_album) : null,
        fecha_lanzamiento: form.fecha_lanzamiento || null,
        letra: form.letra,
        explicit: form.explicit ? 1 : 0,
        archivo_audio: archivo
      };

      if (isNew) {
        await api.post('/songs', payload);
        onSaved('Canción creada.');
      } else {
        await api.put(`/songs/${song.id_cancion}`, payload);
        onSaved('Canción actualizada.');
      }
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar la canción.'));
      setBusy(false);
    }
  };

  // Albums must belong to the selected artist.
  const albumOptions = albums.filter(
    (a) => !form.id_artista || a.id_artista === Number(form.id_artista)
  );

  return (
    <Modal
      title={isNew ? 'Nueva canción' : `Editar «${song.titulo}»`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="song-form" className="btn btn--primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="song-form" className="stack" onSubmit={submit}>
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
            <span className="field-label">Álbum</span>
            <select className="input" value={form.id_album} onChange={update('id_album')}>
              <option value="">Sin álbum</option>
              {albumOptions.map((a) => (
                <option key={a.id_album} value={a.id_album}>
                  {a.titulo}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Duración (segundos)</span>
            <input
              className="input"
              type="number"
              min="0"
              value={form.duracion}
              onChange={update('duracion')}
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

        <label className="field">
          <span className="field-label">Letra</span>
          <textarea
            className="input"
            value={form.letra}
            onChange={update('letra')}
            rows={4}
          />
        </label>

        <label className="switch">
          <input type="checkbox" checked={form.explicit} onChange={update('explicit')} />
          <span className="switch-track" />
          <span>Contenido explícito</span>
        </label>

        <div className="field">
          <span className="field-label">Archivo de audio</span>
          {song.archivo_audio && (
            <span className="field-hint">
              Actual: <code>{song.archivo_audio}</code>
            </span>
          )}
          <input
            className="input"
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            style={{ paddingTop: 8 }}
          />
          <span className="field-hint">MP3, WAV, OGG o M4A. Máximo 50 MB.</span>
        </div>
      </form>
    </Modal>
  );
}
