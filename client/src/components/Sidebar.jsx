import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Artwork from './Artwork';
import Logo from './Logo';
import {
  HomeIcon,
  SearchIcon,
  PlusIcon,
  ChevronDown,
  PlayIcon,
  PlaylistIcon,
  MusicIcon,
} from './icons';
import { coverStyle } from '../utils';
import { useI18n } from '../i18n';

/**
 * Shortcuts into the genre catalogue; mirrors Spotify's browse rows.
 * These are `album.genero` values stored in the database, not UI chrome, so
 * they are deliberately left untranslated.
 */
const GENRES = [
  'Synth-pop',
  'Indie tropical',
  'Post-rock',
  'Indie folk',
  'Electronica',
  'Pop urbano',
];

export default function Sidebar({ onCreatePlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    api
      .get('/playlists')
      .then(({ data }) => alive && setPlaylists(data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [location.pathname]);

  return (
    <nav className="sidebar" aria-label={t('nav.mainNavigation')}>
      <div className="sidebar-logo">
        <Logo size={28} />
        <span>Bootleg</span>
      </div>

      <div className="sidebar-main">
        <div className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-pill${isActive ? ' is-active' : ''}`}
          >
            <HomeIcon size={24} />
            <span>{t('nav.home')}</span>
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) => `nav-pill${isActive ? ' is-active' : ''}`}
          >
            <SearchIcon size={24} />
            <span>{t('nav.search')}</span>
          </NavLink>
        </div>

        <hr className="sidebar-divider" />

        <div className="sidebar-library">
          <div className="sidebar-library-head">
            <button
              type="button"
              className="sidebar-create"
              onClick={onCreatePlaylist}
            >
              <PlusIcon size={20} />
              <span>{t('nav.createPlaylist')}</span>
            </button>
            <button
              type="button"
              className="toggle-btn"
              aria-label={t('nav.seeWholeLibrary')}
              title={t('nav.seeWholeLibrary')}
              onClick={() => navigate('/library')}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <div className="sidebar-section-title">{t('nav.library')}</div>

          <div className="sidebar-playlists">
            {playlists.length === 0 && (
              <p className="sidebar-empty">
                {user ? t('library.sidebarEmpty') : t('library.sidebarSignedOut')}
              </p>
            )}

            {playlists.map((p) => (
              <NavLink
                key={p.id_playlist}
                to={`/playlists/${p.id_playlist}`}
                className={({ isActive }) => `library-item${isActive ? ' is-active' : ''}`}
              >
                <div className="library-item-art">
                  <Artwork seed={p.id_playlist} icon={PlaylistIcon} />
                </div>
                <span>{p.nombre_playlist}</span>
                <span className="library-item-play" aria-hidden="true">
                  <PlayIcon size={16} />
                </span>
              </NavLink>
            ))}

            {GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                className="library-item"
                onClick={() => navigate(`/search?q=${encodeURIComponent(genre)}`)}
              >
                <div
                  className="library-item-art library-item-art--genre"
                  style={coverStyle(genre)}
                >
                  <MusicIcon size={20} />
                </div>
                <span>{genre}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
