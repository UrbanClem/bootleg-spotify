import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import { DetailHero, DetailActions, DetailStats, ArtistMeta } from '../components/DetailPage';
import { EmptyState, Spinner } from '../components/Feedback';
import { MusicIcon } from '../components/icons';
import { heroTint, errorMessage } from '../utils';
import { useI18n } from '../i18n';

export default function Album() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, date } = useI18n();
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
      .catch((err) => alive && setError(errorMessage(err, t, t('album.loadError'))))
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
          title={t('album.notFound')}
          action={
            <button type="button" className="btn btn--primary" onClick={() => navigate('/search')}>
              {t('album.searchMusic')}
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
        kindLabel={t('kind.album')}
        title={album.titulo}
        tint={heroTint(album.id_album)}
        art={album.portada}
        meta={meta}
      />

      <DetailActions onPlay={handlePlay} isPlaying={isCurrent && isPlaying} hasAudio={hasAudio}>
        {!hasAudio && songs.length > 0 && (
          <span className="text-subdued" style={{ fontSize: 13 }}>
            {t('album.noAudioYet')}
          </span>
        )}
      </DetailActions>

      <DetailStats>
        <span>
          <strong>{songs.length}</strong>{' '}
          {songs.length === 1 ? t('label.song') : t('label.songs')}
        </span>
        {totalSeconds > 0 && (
          <span>{t('plural.minute', { n: Math.round(totalSeconds / 60) })}</span>
        )}
        {album.fecha_lanzamiento && <span>{date(album.fecha_lanzamiento)}</span>}
      </DetailStats>

      <div className="page detail-body">
        {songs.length === 0 ? (
          <EmptyState icon={MusicIcon} title={t('album.emptyTitle')}>
            {t('album.emptyText')}
          </EmptyState>
        ) : (
          <div className="track-list">
            <div className="track-head">
              <span>#</span>
              <span>{t('track.title')}</span>
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
