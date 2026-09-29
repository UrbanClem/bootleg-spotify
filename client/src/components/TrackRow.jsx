import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useI18n } from '../i18n';
import Artwork from './Artwork';
import {
  PlayIcon,
  MoreIcon,
  PlusIcon,
  VerifiedIcon,
} from './icons';
import { formatDuration, coverStyle } from '../utils';

/** Animated bars shown on the currently playing track. */
function Equalizer({ paused }) {
  return (
    <span className={`equalizer${paused ? ' is-paused' : ''}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

/**
 * One row in a track list.
 *
 * Handles its own play/pause affordance: the row number turns into a play
 * button on hover, and becomes an equalizer when the track is the current one.
 */
export default function TrackRow({
  song,
  index,
  queue,
  showArt = true,
  showAlbum = true,
  showIndex = true,
  onMenu,
}) {
  const { playSong, currentSong, isPlaying, togglePlay, addToQueue } = usePlayer();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = Boolean(currentSong && song.id_cancion === currentSong.id_cancion);
  const playQueue = queue ?? [song];

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else playSong(song, playQueue);
  };

  const cover = song.portada_album
    ? `/uploads/images/${song.portada_album}`
    : null;

  const explicit = song.explicit === 1 || song.explicit === true;

  return (
    <div className={`track-row${isCurrent ? ' is-current' : ''}`}>
      {showIndex && (
        <div className="track-index">
          {isCurrent ? (
            <Equalizer paused={!isPlaying} />
          ) : (
            <>
              <span className="track-index-num">{index + 1}</span>
              <button
                type="button"
                className="track-play"
                onClick={handlePlay}
                aria-label={t('track.play', { title: song.titulo })}
              >
                <PlayIcon size={16} />
              </button>
            </>
          )}
        </div>
      )}

      <div className="track-main">
        {showArt && (
          <button
            type="button"
            className="track-art"
            onClick={handlePlay}
            aria-label={t('track.play', { title: song.titulo })}
            style={coverStyle(song.id_album ?? song.titulo)}
          >
            <Artwork src={cover} alt="" seed={song.id_album ?? song.titulo} />
          </button>
        )}

        <div className="track-meta">
          <div className="track-title" title={song.titulo}>
            {song.titulo}
            {explicit && (
              <span className="track-explicit" title={t('track.explicit')}>
                E
              </span>
            )}
          </div>
          <div className="track-artist">
            {song.id_artista ? (
              <Link to={`/artists/${song.id_artista}`}>{song.nombre_artista}</Link>
            ) : (
              song.nombre_artista || t('track.unknownArtist')
            )}
            {song.artista_verificado ? <VerifiedIcon size={12} style={{ marginLeft: 4 }} /> : null}
          </div>
        </div>
      </div>

      {showAlbum && song.titulo_album && (
        <div className="track-cell track-cell--album">
          {song.id_album ? (
            <Link to={`/albums/${song.id_album}`}>{song.titulo_album}</Link>
          ) : (
            song.titulo_album
          )}
        </div>
      )}

      <div className="track-actions">
        <button
          type="button"
          className="toggle-btn"
          onClick={() => addToQueue(song)}
          aria-label={t('track.addToQueue', { title: song.titulo })}
          title={t('track.addToQueueShort')}
        >
          <PlusIcon size={16} />
        </button>

        <span className="track-duration">{formatDuration(song.duracion)}</span>

        {onMenu && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t('track.moreOptions', { title: song.titulo })}
              aria-expanded={menuOpen}
            >
              <MoreIcon size={16} />
            </button>
            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 89 }}
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="menu" style={{ right: 0, bottom: '100%', marginBottom: 4 }}>
                  {onMenu({ song, close: () => setMenuOpen(false) })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
