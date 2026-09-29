import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import Modal from '../components/Modal';
import Artwork from '../components/Artwork';
import { DetailHero, DetailActions, DetailStats } from '../components/DetailPage';
import { EmptyState, Spinner, Alert } from '../components/Feedback';
import { PlaylistIcon, EditIcon, TrashIcon, PlayIcon, PlusIcon, MusicIcon, MoreIcon } from '../components/icons';
import { heroTint, errorMessage, formatDuration } from '../utils';

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSong, currentSong, isPlaying, togglePlay, addToQueue } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/playlists/${id}`)
      .then(({ data }) => {
        setPlaylist(data);
        setError('');
      })
      .catch((err) => setError(errorMessage(err, 'No se pudo cargar la playlist.')))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  const removeSong = async (songId) => {
    try {
      await api.delete(`/playlists/${id}/songs/${songId}`);
      load();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo quitar la canción.'));
    }
  };

  const removePlaylist = async () => {
    try {
      await api.delete(`/playlists/${id}`);
      navigate('/library', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'No se pudo eliminar la playlist.'));
    }
  };

  if (loading && !playlist) return <Spinner center />;

  if (error && !playlist) {
    return (
      <div className="page">
        <EmptyState
          icon={PlaylistIcon}
          title="Playlist no encontrada"
          action={
            <button type="button" className="btn btn--primary" onClick={() => navigate('/library')}>
              Ir a tu biblioteca
            </button>
          }
        >
          {error}
        </EmptyState>
      </div>
    );
  }

  const songs = playlist?.canciones ?? [];
  const totalSeconds = songs.reduce((sum, s) => sum + (Number(s.duracion) || 0), 0);
  const isCurrent = songs.some((s) => s.id_cancion === currentSong?.id_cancion);
  const hasAudio = songs.some((s) => s.archivo_audio);
  const isOwner = user && playlist && user.id_usuario === playlist.id_usuario;

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else if (songs.length) playSong(songs[0], songs);
  };

  return (
    <>
      <DetailHero
        kindLabel="Playlist"
        title={playlist.nombre_playlist}
        tint={heroTint(playlist.id_playlist)}
        art={playlist.portada ? `/uploads/images/${playlist.portada}` : null}
        note={playlist.descripcion}
        meta={
          <>
            <span className="hero-artist">{playlist.nombre_usuario ?? 'Tu cuenta'}</span>
            <span className="dot">•</span>
            <span>
              {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
            </span>
            {totalSeconds > 0 && (
              <>
                <span className="dot">•</span>
                <span>{formatDuration(totalSeconds)}</span>
              </>
            )}
          </>
        }
      />

      <DetailActions onPlay={handlePlay} isPlaying={isCurrent && isPlaying} hasAudio={hasAudio}>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="toggle-btn"
            aria-label="Opciones de la playlist"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreIcon size={26} />
          </button>
          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 89 }}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="menu" style={{ left: 0, top: 'calc(100% + 8px)' }} role="menu">
                {isOwner && (
                  <>
                    <button
                      type="button"
                      className="menu-item"
                      onClick={() => {
                        setMenuOpen(false);
                        setEditOpen(true);
                      }}
                    >
                      <EditIcon size={16} /> Editar detalles
                    </button>
                    <button
                      type="button"
                      className="menu-item"
                      onClick={() => {
                        setMenuOpen(false);
                        setAddOpen(true);
                      }}
                    >
                      <PlusIcon size={16} /> Añadir canciones
                    </button>
                    <hr className="menu-divider" />
                    <button
                      type="button"
                      className="menu-item menu-item--danger"
                      onClick={removePlaylist}
                    >
                      <TrashIcon size={16} /> Eliminar playlist
                    </button>
                  </>
                )}
                {!isOwner && (
                  <p className="sidebar-empty">Solo el propietario puede editarla.</p>
                )}
              </div>
            </>
          )}
        </div>
      </DetailActions>

      {error && (
        <div style={{ padding: '0 var(--page-pad) 16px' }}>
          <Alert onDismiss={() => setError('')}>{error}</Alert>
        </div>
      )}

      <DetailStats>
        <span>
          <strong>{songs.length}</strong> {songs.length === 1 ? 'canción' : 'canciones'}
        </span>
        {playlist.fecha_creacion && (
          <span>Creada el {new Date(playlist.fecha_creacion).toLocaleDateString('es-ES')}</span>
        )}
      </DetailStats>

      <div className="page detail-body">
        {songs.length === 0 ? (
          <EmptyState
            icon={MusicIcon}
            title="Esta playlist está vacía"
            action={
              isOwner ? (
                <button type="button" className="btn btn--primary" onClick={() => setAddOpen(true)}>
                  Añadir canciones
                </button>
              ) : null
            }
          >
            Usa el botón «Añadir canciones» para empezar a llenarla.
          </EmptyState>
        ) : (
          <>
            <div className="row" style={{ marginBottom: 16 }}>
              <button type="button" className="btn btn--outline" onClick={() => playSong(songs[0], songs)}>
                <PlayIcon size={16} /> Reproducir
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => songs.forEach(addToQueue)}
              >
                Añadir a la cola
              </button>
            </div>

            <div className="track-list">
              {songs.map((song, i) => (
                <TrackRow
                  key={`${song.id_cancion}-${i}`}
                  song={song}
                  index={i}
                  queue={songs}
                  onMenu={
                    isOwner
                      ? ({ song: s, close }) => (
                          <>
                            <button
                              type="button"
                              className="menu-item menu-item--danger"
                              onClick={() => {
                                close();
                                removeSong(s.id_cancion);
                              }}
                            >
                              <TrashIcon size={16} /> Quitar de la playlist
                            </button>
                          </>
                        )
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      {editOpen && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            load();
          }}
        />
      )}

      {addOpen && (
        <AddSongsModal
          playlistId={playlist.id_playlist}
          existingIds={songs.map((s) => s.id_cancion)}
          onClose={() => setAddOpen(false)}
          onAdded={() => {
            setAddOpen(false);
            load();
          }}
        />
      )}
    </>
  );
}

function EditPlaylistModal({ playlist, onClose, onSaved }) {
  const [name, setName] = useState(playlist.nombre_playlist);
  const [description, setDescription] = useState(playlist.descripcion ?? '');
  const [isPrivate, setIsPrivate] = useState(Boolean(playlist.privada));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setBusy(true);
    try {
      await api.put(`/playlists/${playlist.id_playlist}`, {
        nombre_playlist: name.trim(),
        descripcion: description.trim(),
        privada: isPrivate
      });
      onSaved();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar.'));
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Editar detalles de la playlist"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="edit-playlist" className="btn btn--primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="edit-playlist" className="stack" onSubmit={submit}>
        {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

        <label className="field">
          <span className="field-label">Nombre</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </label>

        <label className="field">
          <span className="field-label">Descripción</span>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        </label>

        <label className="switch">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <span className="switch-track" />
          <span>Privada</span>
        </label>
      </form>
    </Modal>
  );
}

function AddSongsModal({ playlistId, existingIds, onClose, onAdded }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get('/songs')
      .then(({ data }) => alive && setSongs(data))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = songs.filter(
    (s) =>
      !existingIds.includes(s.id_cancion) &&
      (query.trim() === '' ||
        s.titulo.toLowerCase().includes(query.toLowerCase()) ||
        (s.nombre_artista ?? '').toLowerCase().includes(query.toLowerCase()))
  );

  const add = async (song) => {
    setBusy(true);
    setError('');
    try {
      await api.post(`/playlists/${playlistId}/songs`, { id_cancion: song.id_cancion });
      onAdded();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo añadir la canción.'));
      setBusy(false);
    }
  };

  return (
    <Modal title="Añadir canciones" onClose={onClose} wide>
      {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

      <div className="input-group">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrar por título o artista"
          aria-label="Filtrar canciones"
        />
      </div>

      {loading ? (
        <Spinner center />
      ) : filtered.length === 0 ? (
        <p className="text-subdued" style={{ fontSize: 14 }}>
          No hay canciones que añadir.
        </p>
      ) : (
        <div className="track-list" style={{ maxHeight: 360, overflowY: 'auto' }}>
          {filtered.map((song) => (
            <div key={song.id_cancion} className="track-row" style={{ gridTemplateColumns: '40px 1fr auto' }}>
              <div className="track-art">
                <Artwork
                  src={song.portada_album ? `/uploads/images/${song.portada_album}` : null}
                  alt=""
                  seed={song.id_album ?? song.titulo}
                />
              </div>
              <div className="track-meta">
                <div className="track-title">{song.titulo}</div>
                <div className="track-artist">{song.nombre_artista}</div>
              </div>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                disabled={busy}
                onClick={() => add(song)}
              >
                Añadir
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
