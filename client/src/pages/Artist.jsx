import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import MediaCard from '../components/MediaCard';
import { DetailHero, DetailActions, DetailStats } from '../components/DetailPage';
import { EmptyState, Spinner } from '../components/Feedback';
import { ArtistIcon, PlayIcon } from '../components/icons';
import { heroTint, errorMessage } from '../utils';
import { useI18n } from '../i18n';

export default function Artist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, date, n } = useI18n();
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
      .catch((err) => alive && setError(errorMessage(err, t, t('artist.loadError'))))
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
          title={t('artist.notFound')}
          action={
            <button type="button" className="btn btn--primary" onClick={() => navigate('/search')}>
              {t('artist.searchArtists')}
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
        kindLabel={t('kind.artist')}
        title={artist.nombre_artista}
        tint={heroTint(artist.id_artista)}
        art={artist.foto_perfil ? `/uploads/artists/${artist.foto_perfil}` : null}
        round
        meta={
          artist.seguidores ? (
            <span>{t('artist.followers', { n: n(artist.seguidores) })}</span>
          ) : (
            <span>{t('artist.generic')}</span>
          )
        }
        note={artist.biografia}
      />

      <DetailActions onPlay={handlePlay} isPlaying={isCurrent && isPlaying} hasAudio={hasAudio} />

      <DetailStats>
        <span>
          <strong>{songs.length}</strong>{' '}
          {songs.length === 1 ? t('label.song') : t('label.songs')}
        </span>
        {artist.fecha_registro && (
          <span>{t('artist.onPlatformSince', { date: date(artist.fecha_registro) })}</span>
        )}
      </DetailStats>

      <div className="page detail-body">
        {songs.length === 0 ? (
          <EmptyState icon={ArtistIcon} title={t('artist.emptyTitle')}>
            {t('artist.emptyText')}
          </EmptyState>
        ) : (
          <>
            <div className="section-head">
              <h2 className="section-title">{t('artist.popular')}</h2>
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
                <PlayIcon size={16} /> {t('artist.playPopular')}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => songs.forEach(addToQueue)}>
                {t('artist.addAllToQueue')}
              </button>
            </div>

            {songs.length > popular.length && (
              <>
                <div className="section-head">
                  <h2 className="section-title">{t('label.songs')}</h2>
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
                    {showAll ? t('artist.seeLess') : t('artist.seeAllSongs', { n: songs.length })}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        <section className="section" style={{ marginTop: 40 }}>
          <div className="section-head">
            <h2 className="section-title">{t('artist.appearsOn')}</h2>
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
  const { t } = useI18n();
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
          subtitle={t('artist.appearsOnSubtitle', {
            year: album.fecha_lanzamiento?.slice(0, 4) ?? '',
            count: t('plural.song', { n: album.total_canciones ?? 0 })
          })}
          onPlay
        />
      ))}
    </div>
  );
}
