import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import { DetailHero, DetailActions, DetailStats, ArtistMeta } from '../components/DetailPage';
import { EmptyState, Spinner } from '../components/Feedback';
import { MusicIcon } from '../components/icons';
import { formatDate, heroTint, errorMessage } from '../utils';

export default function Album() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    api
      .get(`/albums/${id}`)
      .then(({ data }) => alive && setAlbum(data))
      .catch((err) => alive && setError(errorMessage(err, 'No se pudo cargar el álbum.')))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <Spinner center />;

  if (error || !album) {
    return (
      <div className="page">
        <EmptyState
          icon={MusicIcon}
          title="Álbum no encontrado"
          action={
            <button type="button" className="btn btn--primary" onClick={() => navigate('/search')}>
              Buscar música
            </button>
          }
        >
          {error}
        </EmptyState>
      </div>
    );
  }

  // Album tracks arrive without every join field the shared track row expects.
  // Filling them in from the parent record keeps links and artwork resolvable.
  const songs = (album.canciones ?? []).map((s) => ({
    ...s,
    id_album: s.id_album ?? album.id_album,
    id_artista: s.id_artista ?? album.id_artista,
    nombre_artista: s.nombre_artista ?? album.nombre_artista,
    portada_album: s.portada_album ?? album.portada,
    titulo_album: s.titulo_album ?? album.titulo
  }));

  const totalSeconds = songs.reduce((sum, s) => sum + (Number(s.duracion) || 0), 0);
  const isCurrent = currentSong?.id_album === album.id_album;
  const hasAudio = songs.some((s) => s.archivo_audio);

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else if (songs.length) playSong(songs[0], songs);
  };

  const meta = (
    <>
      <ArtistMeta id={album.id_artista} name={album.nombre_artista} />
      <span>{album.fecha_lanzamiento ? album.fecha_lanzamiento.slice(0, 4) : '—'}</span>
      {album.genero && (
        <>
          <span className="dot">•</span>
          <span>{album.genero}</span>
        </>
      )}
    </>
  );

  return (
    <>
      <DetailHero
        kindLabel="Álbum"
        title={album.titulo}
        tint={heroTint(album.id_album)}
        art={album.portada ? `/uploads/images/${album.portada}` : null}
        meta={meta}
      />

      <DetailActions onPlay={handlePlay} isPlaying={isCurrent && isPlaying} hasAudio={hasAudio}>
        {!hasAudio && songs.length > 0 && (
          <span className="text-subdued" style={{ fontSize: 13 }}>
            Sin audio cargado todavía
          </span>
        )}
      </DetailActions>

      <DetailStats>
        <span>
          <strong>{songs.length}</strong> {songs.length === 1 ? 'canción' : 'canciones'}
        </span>
        {totalSeconds > 0 && <span>{Math.round(totalSeconds / 60)} min</span>}
        {album.fecha_lanzamiento && <span>{formatDate(album.fecha_lanzamiento)}</span>}
      </DetailStats>

      <div className="page detail-body">
        {songs.length === 0 ? (
          <EmptyState icon={MusicIcon} title="Este álbum todavía no tiene canciones">
            Añade canciones desde el panel de administración.
          </EmptyState>
        ) : (
          <div className="track-list">
            <div className="track-head">
              <span>#</span>
              <span>Título</span>
              <span className="track-cell--album" />
              <span />
            </div>
            {songs.map((song, i) => (
              <TrackRow
                key={song.id_cancion}
                song={song}
                index={i}
                queue={songs}
                showArt={false}
                showAlbum={false}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
