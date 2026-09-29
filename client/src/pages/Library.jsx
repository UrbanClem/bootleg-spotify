import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MediaCard from '../components/MediaCard';
import { EmptyState, Spinner, Alert } from '../components/Feedback';
import { PlaylistIcon, SearchIcon, SortIcon } from '../components/icons';
import { errorMessage } from '../utils';

const SORTS = [
  { id: 'recientes', label: 'Añadidas recientemente' },
  { id: 'nombre', label: 'Nombre' },
  { id: 'canciones', label: 'Número de canciones' }
];

/** The user's own playlists, with search and sorting. */
export default function Library() {
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
      .catch((err) => alive && setError(errorMessage(err, 'No se pudo cargar tu biblioteca.')))
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
      filtered.sort((a, b) => a.nombre_playlist.localeCompare(b.nombre_playlist, 'es'));
    } else if (sort === 'canciones') {
      filtered.sort((a, b) => (b.total_canciones ?? 0) - (a.total_canciones ?? 0));
    }
    return filtered;
  }, [playlists, query, sort]);

  return (
    <div className="page">
      <div className="greeting">
        <h1 className="greeting-title">Tu biblioteca</h1>
      </div>

      <div className="filter-bar">
        <div className="input-group">
          <SearchIcon size={20} />
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtra por nombre"
            aria-label="Filtrar playlists"
          />
        </div>

        <select
          className="filter-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Ordenar por"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="chip" style={{ marginLeft: 'auto' }}>
          <SortIcon size={14} /> {visible.length} {visible.length === 1 ? 'playlist' : 'playlists'}
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
          title="Todavía no tienes playlists"
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/search')}
            >
              Explorar música
            </button>
          }
        >
          Usa «Crear playlist» en la barra lateral para empezar una.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon={SearchIcon} title="Sin resultados">
          Ninguna playlist coincide con «{query}».
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
                  ? `${p.total_canciones} ${p.total_canciones === 1 ? 'canción' : 'canciones'}`
                  : 'Vacía'
              }
              onPlay
            />
          ))}
        </div>
      )}
    </div>
  );
}
