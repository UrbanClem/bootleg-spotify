import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import Shelf from '../components/Shelf';
import MediaCard from '../components/MediaCard';
import Artwork from '../components/Artwork';
import { Alert, Spinner, EmptyState } from '../components/Feedback';
import { MusicIcon, PlaylistIcon, PlayIcon, SearchIcon } from '../components/icons';
import { greetingKey, shuffle, errorMessage } from '../utils';
import { useI18n } from '../i18n';
import { imageUrl } from '../media';

/**
 * Landing page. Layout follows Spotify: a grid of shortcut tiles, then shelves
 * of playlists, new releases, popular artists and a hero "made for you" list.
 */
export default function Home() {
  const { user } = useAuth();
  const { playSong, playNextInQueue } = usePlayer();
  const { t } = useI18n();

  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    Promise.all([
      api.get('/playlists'),
      api.get('/albums'),
      api.get('/artists'),
      api.get('/songs')
    ])
      .then(([p, a, ar, s]) => {
        if (!alive) return;
        setPlaylists(p.data);
        setAlbums(a.data);
        setArtists(ar.data);
        setSongs(s.data);
      })
      .catch((err) => alive && setError(errorMessage(err, t, t('home.loadError'))))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  // A deterministic-feeling "for you" pick: the top tracks, shuffled once.
  const mix = useMemo(() => (songs.length ? shuffle(songs).slice(0, 8) : []), [songs]);

  const newReleases = useMemo(
    () =>
      [...albums]
        .sort((a, b) => new Date(b.fecha_lanzamiento || 0) - new Date(a.fecha_lanzamiento || 0))
        .slice(0, 8),
    [albums]
  );

  const popular = useMemo(
    () => [...albums].sort((a, b) => (b.popularidad ?? 0) - (a.popularidad ?? 0)).slice(0, 8),
    [albums]
  );

  const topArtists = useMemo(() => artists.slice(0, 8), [artists]);

  if (loading) return <Spinner center />;

  return (
    <div className="page">
      {error && (
        <div style={{ marginBottom: 24 }}>
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="greeting">
        <div>
          <h1 className="greeting-title">{t(greetingKey())}</h1>
          {user && <p className="greeting-sub">{t('home.subtitle')}</p>}
        </div>
      </div>

      {/* Shortcut tiles: recently used playlists and a couple of entry points. */}
      <div className="shortcuts">
        {playlists.slice(0, 6).map((p) => (
          <Link key={p.id_playlist} className="shortcut" to={`/playlists/${p.id_playlist}`}>
            <div className="shortcut-art">
              <Artwork seed={p.id_playlist} icon={PlaylistIcon} />
            </div>
            <span className="shortcut-title">{p.nombre_playlist}</span>
          </Link>
        ))}

        <Link className="shortcut" to="/search">
          <div
            className="shortcut-art"
            style={{
              background: 'var(--cover-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SearchIcon size={26} />
          </div>
          <span className="shortcut-title">{t('home.searchMusic')}</span>
        </Link>
      </div>

      <Shelf
        title={t('home.madeForYou')}
        subtitle={t('home.madeForYouSub')}
        items={mix}
        kind="song"
        onPlay={(song) => playSong(song, mix)}
        renderItem={(song) => (
          <div className="card">
            <div className="card-artwork-wrap">
              <Artwork
                src={imageUrl(song.portada_album)}
                alt={song.titulo}
                seed={song.id_album ?? song.titulo}
              />
            </div>
            <div className="card-body">
              <div className="card-title">{song.titulo}</div>
              <div className="card-subtitle">{song.nombre_artista}</div>
            </div>
            <button
              type="button"
              className="card-play"
              onClick={() => playSong(song, mix)}
              aria-label={t('track.play', { title: song.titulo })}
            >
              <PlayIcon size={18} />
            </button>
          </div>
        )}
      />

      <Shelf title={t('home.yourPlaylists')} to="/library" items={playlists} kind="playlist" onPlay />

      <Shelf title={t('home.newAlbums')} to="/search" items={newReleases} kind="album" onPlay />

      <Shelf
        title={t('home.artistsYouLike')}
        to="/search"
        items={topArtists}
        kind="artist"
        renderItem={(artist) => (
          <MediaCard
            item={artist}
            kind="artist"
            title={artist.nombre_artista}
            subtitle={
              artist.total_canciones
                ? t('plural.song', { n: artist.total_canciones })
                : t('artist.generic')
            }
            seed={artist.id_artista}
          />
        )}
      />

      {mix.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">{t('home.popularNow')}</h2>
          </div>
          <div className="panel">
            <div className="track-list">
              {mix.slice(0, 5).map((song, i) => (
                <div key={song.id_cancion} className="mix-row">
                  <span className="mix-rank">{i + 1}</span>
                  <button
                    type="button"
                    className="mix-art"
                    onClick={() => playSong(song, mix)}
                    aria-label={t('track.play', { title: song.titulo })}
                  >
                    <Artwork
                      src={imageUrl(song.portada_album)}
                      alt=""
                      seed={song.id_album ?? song.titulo}
                      icon={MusicIcon}
                    />
                  </button>
                  <div className="mix-meta">
                    <div className="track-title">{song.titulo}</div>
                    <div className="track-artist">{song.nombre_artista}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => playNextInQueue(song)}
                  >
                    {t('player.playNext')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {playlists.length === 0 && albums.length === 0 && (
        <EmptyState
          icon={MusicIcon}
          title={t('home.emptyTitle')}
          action={
            <Link className="btn btn--primary" to="/search">
              {t('home.browseCatalogue')}
            </Link>
          }
        >
          {t('home.emptyText')}
        </EmptyState>
      )}
    </div>
  );
}
