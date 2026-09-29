import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MediaCard from '../components/MediaCard';
import { EmptyState, Spinner, Alert } from '../components/Feedback';
import { PlaylistIcon, SearchIcon, SortIcon } from '../components/icons';
import { errorMessage } from '../utils';
import { useI18n } from '../i18n';

const SORTS = [
  { id: 'recientes', labelKey: 'library.sortRecent' },
  { id: 'nombre', labelKey: 'library.sortName' },
  { id: 'canciones', labelKey: 'library.sortSongs' }
];

/** The user's own playlists, with search and sorting. */
export default function Library() {
  const { t, locale } = useI18n();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recientes');
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    api
      .get('/playlists')
      .then(({ data }) => {
        if (!alive) return;
        setPlaylists(data);
        setError('');
      })
      .catch((err) => alive && setError(errorMessage(err, t, t('library.loadError'))))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term
      ? playlists.filter((p) => p.nombre_playlist.toLowerCase().includes(term))
      : [...playlists];

    if (sort === 'nombre') {
      // Sort in the active UI language so accented titles group together.
      filtered.sort((a, b) => a.nombre_playlist.localeCompare(b.nombre_playlist, locale));
    } else if (sort === 'canciones') {
      filtered.sort((a, b) => (b.total_canciones ?? 0) - (a.total_canciones ?? 0));
    }
    return filtered;
  }, [playlists, query, sort, locale]);

  return (
    <div className="page">
      <div className="greeting">
        <h1 className="greeting-title">{t('library.title')}</h1>
      </div>

      <div className="filter-bar">
        <div className="input-group">
          <SearchIcon size={20} />
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('library.filterPlaceholder')}
            aria-label={t('library.filterLabel')}
          />
        </div>

        <select
          className="filter-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label={t('library.sortBy')}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {t(s.labelKey)}
            </option>
          ))}
        </select>

        <span className="chip" style={{ marginLeft: 'auto' }}>
          <SortIcon size={14} /> {t('library.count', { n: visible.length })}
        </span>
      </div>

      {error && (
        <div style={{ marginBottom: 24 }}>
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner center />
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={PlaylistIcon}
          title={t('library.emptyTitle')}
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/search')}
            >
              {t('library.browseMusic')}
            </button>
          }
        >
          {t('library.emptyText')}
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon={SearchIcon} title={t('library.noResults')}>
          {t('library.noResultsText', { query })}
        </EmptyState>
      ) : (
        <div className="card-grid">
          {visible.map((p) => (
            <MediaCard
              key={p.id_playlist}
              item={p}
              kind="playlist"
              subtitle={
                p.total_canciones
                  ? t('plural.song', { n: p.total_canciones })
                  : t('library.emptyPlaylist')
              }
              onPlay
            />
          ))}
        </div>
      )}
    </div>
  );
}
