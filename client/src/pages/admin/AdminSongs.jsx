import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';
import Modal from '../../components/Modal';
import { Alert, EmptyState, Spinner } from '../../components/Feedback';
import {
  PlusIcon, EditIcon, TrashIcon, SearchIcon, MusicIcon, PlayIcon
} from '../../components/icons';
import { errorMessage, formatDuration, toIsoDate } from '../../utils';
import { useI18n } from '../../i18n';
import { audioUrl } from '../../media';

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
  const { t, n } = useI18n();
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
      setError(errorMessage(err, t, t('admin.loadSongsError')));
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
    if (!window.confirm(t('admin.confirmDeleteSong', { name: song.titulo }))) return;
    try {
      await api.delete(`/songs/${song.id_cancion}`);
      setNotice({ type: 'success', text: t('admin.songDeleted') });
      load();
    } catch (err) {
      setError(errorMessage(err, t, t('admin.songDeleteError')));
    }
  };

  if (loading) return <Spinner center />;

  return (
    <>
      <div className="admin-head">
        <div>
          <h2 className="section-title">
            {t('admin.songs')} ({n(songs.length)})
          </h2>
          <p className="text-subdued" style={{ fontSize: 14 }}>
            {t('admin.withAudioCount', {
              n: n(songs.filter((s) => s.archivo_audio).length)
            })}
          </p>
        </div>
        <div className="row">
          <div className="input-group" style={{ flex: '0 1 260px' }}>
            <SearchIcon size={18} />
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('admin.filterSongs')}
              aria-label={t('admin.filterSongs')}
            />
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setEditing({ ...EMPTY })}
          >
            <PlusIcon size={16} /> {t('admin.newSong')}
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
          <EmptyState icon={MusicIcon} title={t('admin.noSongs')}>
            {t('admin.noSongsHint')}
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>{t('field.title')}</th>
                  <th>{t('field.artist')}</th>
                  <th>{t('field.album')}</th>
                  <th className="num">{t('admin.columnDuration')}</th>
                  <th>{t('admin.columnAudio')}</th>
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
                    <td className="text-subdued">
                      {song.nombre_artista ?? t('common.unknown')}
                    </td>
                    <td className="text-subdued">
                      {song.titulo_album ?? t('common.unknown')}
                    </td>
                    <td className="num">{formatDuration(song.duracion)}</td>
                    <td>
                      {song.archivo_audio ? (
                        <a
                          className="tag tag--green"
                          href={audioUrl(song.archivo_audio)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <PlayIcon size={11} /> {t('admin.audioReady')}
                        </a>
                      ) : (
                        <span className="tag tag--warning">{t('admin.audioMissing')}</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => setEditing(song)}
                          aria-label={t('admin.editAction', { name: song.titulo })}
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => remove(song)}
                          aria-label={t('admin.deleteAction', { name: song.titulo })}
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
  const { t } = useI18n();
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
      setError(t('field.titleRequired'));
      return;
    }
    if (!form.id_artista) {
      setError(t('field.selectArtist'));
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
        onSaved(t('admin.songCreated'));
      } else {
        await api.put(`/songs/${song.id_cancion}`, payload);
        onSaved(t('admin.songUpdated'));
      }
    } catch (err) {
      setError(errorMessage(err, t, t('admin.songSaveError')));
      setBusy(false);
    }
  };

  // Albums must belong to the selected artist.
  const albumOptions = albums.filter(
    (a) => !form.id_artista || a.id_artista === Number(form.id_artista)
  );

  return (
    <Modal
      title={isNew ? t('admin.newSong') : t('admin.editSong', { name: song.titulo })}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" form="song-form" className="btn btn--primary" disabled={busy}>
            {busy ? t('common.saving') : t('common.save')}
          </button>
        </>
      }
    >
      <form id="song-form" className="stack" onSubmit={submit}>
        {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

        <label className="field">
          <span className="field-label">{t('field.title')}</span>
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
            <span className="field-label">{t('field.artist')}</span>
            <select
              className="input"
              value={form.id_artista}
              onChange={update('id_artista')}
              required
            >
              <option value="">{t('field.select')}</option>
              {artists.map((a) => (
                <option key={a.id_artista} value={a.id_artista}>
                  {a.nombre_artista}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">{t('field.album')}</span>
            <select className="input" value={form.id_album} onChange={update('id_album')}>
              <option value="">{t('field.noAlbum')}</option>
              {albumOptions.map((a) => (
                <option key={a.id_album} value={a.id_album}>
                  {a.titulo}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">{t('field.duration')}</span>
            <input
              className="input"
              type="number"
              min="0"
              value={form.duracion}
              onChange={update('duracion')}
            />
          </label>

          <label className="field">
            <span className="field-label">{t('field.releaseDate')}</span>
            <input
              className="input"
              type="date"
              value={form.fecha_lanzamiento}
              onChange={update('fecha_lanzamiento')}
            />
          </label>
        </div>

        <label className="field">
          <span className="field-label">{t('field.lyrics')}</span>
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
          <span>{t('field.explicitContent')}</span>
        </label>

        <div className="field">
          <span className="field-label">{t('field.audioFile')}</span>
          {song.archivo_audio && (
            <span className="field-hint">
              {t('field.currentFile', { file: song.archivo_audio })}
            </span>
          )}
          <input
            className="input"
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            style={{ paddingTop: 8 }}
          />
          <span className="field-hint">{t('field.audioHint')}</span>
        </div>
      </form>
    </Modal>
  );
}
