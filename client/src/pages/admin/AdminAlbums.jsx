import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';
import Modal from '../../components/Modal';
import { Alert, EmptyState, Spinner } from '../../components/Feedback';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, AlbumIcon } from '../../components/icons';
import { errorMessage, toIsoDate } from '../../utils';
import { useI18n } from '../../i18n';
import { imageUrl } from '../../media';

const EMPTY = {
  titulo: '',
  id_artista: '',
  fecha_lanzamiento: '',
  genero: '',
  portada: ''
};

/** Full CRUD over the `album` table, including cover upload. */
export default function AdminAlbums() {
  const { t, n } = useI18n();
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
      setError(errorMessage(err, t, t('admin.loadAlbumsError')));
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
    if (!window.confirm(t('admin.confirmDeleteAlbum', { name: album.titulo }))) return;
    try {
      await api.delete(`/albums/${album.id_album}`);
      setNotice({ type: 'success', text: t('admin.albumDeleted') });
      load();
    } catch (err) {
      setError(errorMessage(err, t, t('admin.albumDeleteError')));
    }
  };

  if (loading) return <Spinner center />;

  return (
    <>
      <div className="admin-head">
        <div>
          <h2 className="section-title">
            {t('admin.albums')} ({n(albums.length)})
          </h2>
          <p className="text-subdued" style={{ fontSize: 14 }}>
            {t('admin.withCoverCount', {
              n: n(albums.filter((a) => a.portada).length)
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
              placeholder={t('admin.filterAlbums')}
              aria-label={t('admin.filterAlbums')}
            />
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setEditing({ ...EMPTY })}
          >
            <PlusIcon size={16} /> {t('admin.newAlbum')}
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
          <EmptyState icon={AlbumIcon} title={t('admin.noAlbums')} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>{t('field.title')}</th>
                  <th>{t('field.artist')}</th>
                  <th>{t('field.genre')}</th>
                  <th>{t('admin.columnDate')}</th>
                  <th className="num">{t('admin.columnSongs')}</th>
                  <th>{t('admin.columnCover')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((album) => (
                  <tr key={album.id_album}>
                    <td className="num">{album.id_album}</td>
                    <td className="cell-title">{album.titulo}</td>
                    <td className="text-subdued">
                      {album.nombre_artista ?? t('common.unknown')}
                    </td>
                    <td className="text-subdued">{album.genero ?? t('common.unknown')}</td>
                    <td className="text-subdued">
                      {album.fecha_lanzamiento
                        ? album.fecha_lanzamiento.slice(0, 10)
                        : t('common.unknown')}
                    </td>
                    <td className="num">{n(album.total_canciones ?? 0)}</td>
                    <td>
                      {album.portada ? (
                        <span className="tag tag--green">{t('common.yes')}</span>
                      ) : (
                        <span className="tag">{t('common.no')}</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => setEditing(album)}
                          aria-label={t('admin.editAction', { name: album.titulo })}
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className="toggle-btn"
                          onClick={() => remove(album)}
                          aria-label={t('admin.deleteAction', { name: album.titulo })}
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
  const { t } = useI18n();
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
      setError(t('field.titleRequired'));
      return;
    }
    if (!form.id_artista) {
      setError(t('field.selectArtist'));
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
        onSaved(t('admin.albumCreated'));
      } else {
        await api.put(`/albums/${album.id_album}`, payload);
        onSaved(t('admin.albumUpdated'));
      }
    } catch (err) {
      setError(errorMessage(err, t, t('admin.albumSaveError')));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isNew ? t('admin.newAlbum') : t('admin.editAlbum', { name: album.titulo })}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" form="album-form" className="btn btn--primary" disabled={busy}>
            {busy ? t('common.saving') : t('common.save')}
          </button>
        </>
      }
    >
      <form id="album-form" className="stack" onSubmit={submit}>
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
            <span className="field-label">{t('field.genre')}</span>
            <input
              className="input"
              value={form.genero}
              onChange={update('genero')}
              maxLength={100}
              placeholder={t('field.genrePlaceholder')}
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

        <div className="field">
          <span className="field-label">{t('field.cover')}</span>
          {album.portada && !coverFile && (
            <img
              src={imageUrl(album.portada)}
              alt={t('field.currentCover')}
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
          <span className="field-hint">{t('field.imageHint')}</span>
        </div>
      </form>
    </Modal>
  );
}
