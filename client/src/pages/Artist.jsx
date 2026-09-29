import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import MediaCard from '../components/MediaCard';
import { DetailHero, DetailActions, DetailStats } from '../components/DetailPage';
import { EmptyState, Spinner } from '../components/Feedback';
import { ArtistIcon, PlayIcon } from '../components/icons';
import { heroTint, errorMessage, formatDate } from '../utils';

export default function Artist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const { playSong, currentSong, isPlaying, togglePlay, addToQueue } = usePlayer();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    api
      .get(`/artists/${id}`)
      .then(({ data }) => alive && setArtist(data))
      .catch((err) => alive && setError(errorMessage(err, 'No se pudo cargar el artista.')))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [id]);

  const songs = useMemo(
    () =>
      (artist?.canciones ?? []).map((s) => ({
        ...s,
        id_artista: s.id_artista ?? artist?.id_artista,
        id_album: s.id_album ?? null,
        nombre_artista: s.nombre_artista ?? artist?.nombre_artista
      })),
    [artist]
  );

  const popular = useMemo(() => songs.slice(0, 5), [songs]);

  if (loading) return <Spinner center />;

  if (error || !artist) {
    return (
      <div className="page">
        <EmptyState
          icon={ArtistIcon}
          title="Artista no encontrado"
          action={
            <button type="button" className="btn btn--primary" onClick={() => navigate('/search')}>
              Buscar artistas
            </button>
          }
        >
          {error}
        </EmptyState>
      </div>
    );
  }

  const isCurrent = currentSong?.id_artista === artist.id_artista;
  const hasAudio = songs.some((s) => s.archivo_audio);

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else if (popular.length) playSong(popular[0], songs);
  };

  return (
    <>
      <DetailHero
        kindLabel="Artista"
        title={artist.nombre_artista}
        tint={heroTint(artist.id_artista)}
        art={artist.foto_perfil ? `/uploads/artists/${artist.foto_perfil}` : null}
        round
        meta={
          <>
            <span>{artist.seguidores ? `${artist.seguidores.toLocaleString('es-ES')} seguidores` : 'Artista'}</span>
          </>
        }
        note={artist.biografia}
      />

      <DetailActions onPlay={handlePlay} isPlaying={isCurrent && isPlaying} hasAudio={hasAudio} />

      <DetailStats>
        <span>
          <strong>{songs.length}</strong> {songs.length === 1 ? 'canción' : 'canciones'}
        </span>
        {artist.fecha_registro && <span>En la plataforma desde {formatDate(artist.fecha_registro)}</span>}
      </DetailStats>

      <div className="page detail-body">
        {songs.length === 0 ? (
          <EmptyState icon={ArtistIcon} title="Este artista todavía no tiene canciones">
            Añade canciones desde el panel de administración.
          </EmptyState>
        ) : (
          <>
            <div className="section-head">
              <h2 className="section-title">Populares</h2>
            </div>
            <div className="track-list">
              {popular.map((song, i) => (
                <TrackRow
                  key={song.id_cancion}
                  song={song}
                  index={i}
                  queue={songs}
                  showArt={false}
                />
              ))}
            </div>

            <div className="row" style={{ margin: '16px 0 32px' }}>
              <button type="button" className="btn btn--outline" onClick={() => playSong(popular[0], popular)}>
                <PlayIcon size={16} /> Reproducir populares
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => songs.forEach(addToQueue)}>
                Añadir todo a la cola
              </button>
            </div>

            {songs.length > popular.length && (
              <>
                <div className="section-head">
                  <h2 className="section-title">Todas las canciones</h2>
                </div>
                <div className="track-list">
                  {(showAll ? songs : songs.slice(5)).map((song, i) => (
                    <TrackRow
                      key={song.id_cancion}
                      song={song}
                      index={showAll ? i : i + 5}
                      queue={songs}
                      showArt={false}
                    />
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => setShowAll((v) => !v)}
                  >
                    {showAll ? 'Ver menos' : `Ver las ${songs.length} canciones`}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        <section className="section" style={{ marginTop: 40 }}>
          <div className="section-head">
            <h2 className="section-title">Aparece en</h2>
          </div>
          <AlbumAppearances artistId={artist.id_artista} />
        </section>
      </div>
    </>
  );
}

/**
 * Albums that contain this artist's tracks.
 *
 * The API has no "albums by artist" endpoint, so this derives the list from the
 * album catalogue and de-duplicates by the ids seen on the artist's tracks.
 */
function AlbumAppearances({ artistId }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/albums')
      .then(({ data }) => alive && setAlbums(data.filter((a) => a.id_artista === Number(artistId))))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [artistId]);

  if (loading) return <Spinner />;
  if (albums.length === 0) return null;

  return (
    <div className="card-grid">
      {albums.map((album) => (
        <MediaCard
          key={album.id_album}
          item={album}
          kind="album"
          subtitle={`${album.fecha_lanzamiento?.slice(0, 4) ?? ''} · ${
            album.total_canciones ?? 0
          } canciones`}
          onPlay
        />
      ))}
    </div>
  );
}
