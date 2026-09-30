import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import Artwork from './Artwork';
import { CloseIcon, MusicIcon } from './icons';
import { useI18n } from '../i18n';
import { imageUrl } from '../media';

function QueueEntry({ song, index, playing, onSelect }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className={`queue-item${playing ? ' is-current' : ''}`}
      onClick={() => onSelect(index)}
    >
      <div className="queue-item-art">
        <Artwork
          src={imageUrl(song.portada_album)}
          alt=""
          seed={song.id_album ?? song.titulo}
          icon={MusicIcon}
        />
      </div>
      <div className="queue-item-meta">
        <span className="queue-item-title" title={song.titulo}>
          {song.titulo}
        </span>
        <span className="queue-item-artist">
          {song.nombre_artista || t('track.unknownArtist')}
        </span>
      </div>
    </button>
  );
}

export default function QueuePanel({ onClose }) {
  const { currentSong, queue, currentIndex, playAt } = usePlayer();
  const { t } = useI18n();

  const upcoming = queue.filter((_, i) => i !== currentIndex);

  return (
    <aside className="queue-panel" aria-label={t('player.queuePanel')}>
      <div className="queue-panel-head">
        <span>{t('player.queue')}</span>
        <button
          type="button"
          className="toggle-btn"
          onClick={onClose}
          aria-label={t('player.closeQueue')}
        >
          <CloseIcon size={18} />
        </button>
      </div>

      <div className="queue-panel-body">
        <div className="queue-section-title">{t('player.nowPlaying')}</div>

        {currentSong ? (
          <div className="queue-now">
            <div className="queue-now-art">
              <Artwork
                src={
                  currentSong.portada_album
                    ? imageUrl(currentSong.portada_album)
                    : null
                }
                alt=""
                seed={currentSong.id_album ?? currentSong.titulo}
                icon={MusicIcon}
              />
            </div>
            <div className="queue-now-title">{currentSong.titulo}</div>
            {currentSong.id_artista ? (
              <Link
                className="queue-now-artist"
                to={`/artists/${currentSong.id_artista}`}
              >
                {currentSong.nombre_artista}
              </Link>
            ) : (
              <span className="queue-now-artist">
                {currentSong.nombre_artista || t('track.unknownArtist')}
              </span>
            )}
          </div>
        ) : (
          <p className="queue-empty">{t('player.queueEmptyIdle')}</p>
        )}

        <div className="queue-section-title">{t('player.upNext')}</div>

        {upcoming.length === 0 ? (
          <p className="queue-empty">{t('player.queueEmptyHint')}</p>
        ) : (
          upcoming.map((song, i) => (
            <QueueEntry
              key={`${song.id_cancion}-${i}`}
              song={song}
              index={queue.findIndex((s) => s.id_cancion === song.id_cancion)}
              playing={false}
              onSelect={playAt}
            />
          ))
        )}
      </div>
    </aside>
  );
}
