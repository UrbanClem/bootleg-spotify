import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PlayerBar from './PlayerBar';
import QueuePanel from './QueuePanel';
import Modal from './Modal';
import { Alert } from './Feedback';
import api from '../api';
import { errorMessage } from '../utils';

/**
 * Application chrome: sidebar, sticky top bar, scrollable outlet, optional
 * queue panel and the persistent player bar.
 *
 * The top bar only turns solid once the page scrolls — Spotify lets detail-page
 * heroes bleed underneath it, which is what makes the gradient headers read as
 * part of the layout rather than a banner stuck on top of it.
 */
export default function AppShell() {
  const [solid, setSolid] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const scrollRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { togglePlay } = usePlayer();

  // Reset scroll and re-measure the bar on every navigation.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    setSolid(false);
    setDrawerOpen(false);
  }, [location.pathname, location.search]);

  const handleScroll = useCallback((e) => {
    setSolid(e.currentTarget.scrollTop > 12);
  }, []);

  // Space toggles playback, unless the user is typing.
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.target !== document.body) return;
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) {
        return;
      }
      e.preventDefault();
      togglePlay();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className={`app${drawerOpen ? ' app--drawer-open' : ''}`}>
      {drawerOpen && (
        <div
          className="drawer-scrim"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar onCreatePlaylist={() => setCreateOpen(true)} />

      <div className="main">
        <TopBar solid={solid} onOpenDrawer={() => setDrawerOpen((v) => !v)} />
        <div className="main-scroll" ref={scrollRef} onScroll={handleScroll}>
          <Outlet />
        </div>
      </div>

      {queueOpen && <QueuePanel onClose={() => setQueueOpen(false)} />}

      <PlayerBar
        queueOpen={queueOpen}
        onToggleQueue={() => setQueueOpen((v) => !v)}
      />

      {createOpen && (
        <CreatePlaylistModal
          onClose={() => setCreateOpen(false)}
          onCreated={(id) => {
            setCreateOpen(false);
            if (id) navigate(`/playlists/${id}`);
          }}
          canCreate={Boolean(user)}
        />
      )}
    </div>
  );
}

function CreatePlaylistModal({ onClose, onCreated, canCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Ponle un nombre a la playlist.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/playlists', {
        nombre_playlist: name.trim(),
        descripcion: description.trim(),
        privada: isPrivate
      });
      onCreated(data.id);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo crear la playlist.'));
      setBusy(false);
    }
  };

  if (!canCreate) {
    return (
      <Modal
        title="Crear playlist"
        onClose={onClose}
        footer={
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Entendido
          </button>
        }
      >
        <Alert variant="info">Inicia sesión para poder crear playlists.</Alert>
      </Modal>
    );
  }

  return (
    <Modal
      title="Crear playlist"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="create-playlist"
            className="btn btn--primary"
            disabled={busy}
          >
            {busy ? 'Creando…' : 'Crear'}
          </button>
        </>
      }
    >
      <form id="create-playlist" className="stack" onSubmit={submit}>
        {error && <Alert onDismiss={() => setError('')}>{error}</Alert>}

        <label className="field">
          <span className="field-label">Nombre</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi playlist"
            maxLength={120}
          />
        </label>

        <label className="field">
          <span className="field-label">Descripción</span>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿De qué va esta playlist?"
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

