import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import MediaCard from '../components/MediaCard';
import TrackRow from '../components/TrackRow';
import Artwork from '../components/Artwork';
import { Alert, EmptyState, Spinner } from '../components/Feedback';
import { SearchIcon, CloseIcon, MusicIcon } from '../components/icons';
import { errorMessage, coverStyle } from '../utils';

const TABS = [
  { id: 'todo', label: 'Todo' },
  { id: 'canciones', label: 'Canciones' },
  { id: 'albumes', label: 'Álbumes' },
  { id: 'artistas', label: 'Artistas' }
];

const BROWSE = [
  'Synth-pop', 'Post-rock', 'Indie tropical', 'Alt rock', 'Indie folk',
  'Punk', 'Folktronica', 'Electronica', 'Indie rock', 'Neo soul',
  'Pop urbano', 'Nu Metal'
];

/**
 * Search across the three collections the API exposes.
 *
 * The backend offers no unified endpoint, so the three calls run in parallel
 * and the active tab only decides what gets rendered.
 */
export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [draft, setDraft] = useState(query);
  const [tab, setTab] = useState('todo');
  const [results, setResults] = useState({ songs: [], albums: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Keep the input in sync when the query changes from outside (e.g. a genre
  // shortcut in the sidebar).
  useEffect(() => setDraft(query), [query]);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults({ songs: [], albums: [], artists: [] });
      setError('');
      return undefined;
    }

    let alive = true;
    setLoading(true);
    setError('');

    Promise.all([
      api.get('/search/songs', { params: { q: term } }),
      api.get('/search/albums', { params: { q: term } }),
      api.get('/search/artists', { params: { q: term } })
    ])
      .then(([s, a, ar]) => {
        if (!alive) return;
        setResults({ songs: s.data, albums: a.data, artists: ar.data });
      })
      .catch((err) => {
        if (alive) setError(errorMessage(err, 'La búsqueda falló.'));
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [query]);

  const submit = (e) => {
    e.preventDefault();
    const next = draft.trim();
    setParams(next ? { q: next } : {}, { replace: true });
  };

  const counts = {
    todo: results.songs.length + results.albums.length + results.artists.length,
    canciones: results.songs.length,
    albumes: results.albums.length,
    artistas: results.artists.length
  };

  const show = (id) => tab === 'todo' || tab === id;
  const nothing = counts.todo === 0 && !loading && query.trim() !== '';

  return (
    <div className="page">
      <div className="search-hero">
        <form onSubmit={submit}>
          <div className="input-group">
            <SearchIcon size={24} />
            <input
              ref={inputRef}
              className="input search-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="¿Qué quieres escuchar?"
              aria-label="Buscar"
              autoFocus
            />
            {draft && (
              <button
                type="button"
                className="input-clear"
                onClick={() => {
                  setDraft('');
                  setParams({}, { replace: true });
                  inputRef.current?.focus();
                }}
                aria-label="Limpiar búsqueda"
              >
                <CloseIcon size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div style={{ marginBottom: 24 }}>
          <Alert>{error}</Alert>
        </div>
      )}

      {!query.trim() && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Explorar por género</h2>
          </div>
          <div className="genre-grid">
            {BROWSE.map((genre) => (
              <button
                key={genre}
                type="button"
                className="genre-tile"
                style={coverStyle(genre)}
                onClick={() => setParams({ q: genre }, { replace: true })}
              >
                <strong>{genre}</strong>
                <Artwork seed={genre} icon={MusicIcon} alt="" />
              </button>
            ))}
          </div>
        </section>
      )}

      {query.trim() && !loading && (
        <div className="segmented" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'is-active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {loading && <Spinner center />}

      {!loading && nothing && (
        <EmptyState
          icon={SearchIcon}
          title={`Sin resultados para "${query}"`}
          action={
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                setDraft('');
                setParams({}, { replace: true });
              }}
            >
              Limpiar búsqueda
            </button>
          }
        >
          Prueba con otro artista, álbum o género.
        </EmptyState>
      )}

      {!loading && !nothing && (
        <>
          {show('canciones') && results.songs.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2 className="section-title">Canciones</h2>
                {tab === 'todo' && counts.canciones > 5 && (
                  <button type="button" className="section-link" onClick={() => setTab('canciones')}>
                    Ver todas
                  </button>
                )}
              </div>
              <div className="track-list">
                {results.songs.slice(0, tab === 'todo' ? 5 : undefined).map((song, i) => (
                  <TrackRow
                    key={song.id_cancion}
                    song={song}
                    index={i}
                    queue={results.songs}
                    showAlbum={tab === 'canciones'}
                  />
                ))}
              </div>
            </section>
          )}

          {show('albumes') && results.albums.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2 className="section-title">Álbumes</h2>
                {tab === 'todo' && counts.albumes > 6 && (
                  <button type="button" className="section-link" onClick={() => setTab('albumes')}>
                    Ver todos
                  </button>
                )}
              </div>
              <div className="card-grid">
                {results.albums.slice(0, tab === 'todo' ? 6 : undefined).map((album) => (
                  <MediaCard key={album.id_album} item={album} kind="album" onPlay />
                ))}
              </div>
            </section>
          )}

          {show('artistas') && results.artists.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2 className="section-title">Artistas</h2>
                {tab === 'todo' && counts.artistas > 6 && (
                  <button type="button" className="section-link" onClick={() => setTab('artistas')}>
                    Ver todos
                  </button>
                )}
              </div>
              <div className="card-grid">
                {results.artists.slice(0, tab === 'todo' ? 6 : undefined).map((artist) => (
                  <MediaCard
                    key={artist.id_artista}
                    item={artist}
                    kind="artist"
                    title={artist.nombre_artista}
                    subtitle={artist.total_canciones ? `${artist.total_canciones} canciones` : 'Artista'}
                    seed={artist.id_artista}
                  />
                ))}
              </div>
            </section>
          )}

          {tab === 'todo' &&
            results.songs.length === 0 &&
            results.albums.length === 0 &&
            results.artists.length === 0 && null}
        </>
      )}
    </div>
  );
}
