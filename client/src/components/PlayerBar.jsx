import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useI18n } from '../i18n';
import { imageUrl } from '../media';
import Artwork from './Artwork';
import Slider from './Slider';
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PrevIcon,
  ShuffleIcon,
  RepeatIcon,
  VolumeIcon,
  QueueIcon,
  MusicIcon,
} from './icons';
import { formatDuration } from '../utils';

export default function PlayerBar({ onToggleQueue, queueOpen }) {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    next,
    prev,
    progress,
    duration,
    seekTo,
    volume,
    setVolume,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
  } = usePlayer();
  const { t } = useI18n();

  if (!currentSong) {
    return (
      <footer className="player-bar player-bar--idle">
        <div className="player-now">
          <div className="player-now-art player-now-art--idle" />
          <div className="player-now-meta">
            <span className="player-now-title text-subdued">{t('player.idle')}</span>
            <span className="player-now-artist">{t('player.idleHint')}</span>
          </div>
        </div>
        <div className="player-center" />
        <div className="player-extra" />
      </footer>
    );
  }

  const hasAudio = Boolean(currentSong.archivo_audio);
  const volumeLevel = volume === 0 ? 'muted' : volume < 0.5 ? 'low' : 'high';

  return (
    <footer className="player-bar">
      <div className="player-now">
        <div className="player-now-art">
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

        <div className="player-now-meta">
          <span className="player-now-title" title={currentSong.titulo}>
            {currentSong.titulo}
          </span>
          {currentSong.id_artista ? (
            <Link
              className="player-now-artist"
              to={`/artists/${currentSong.id_artista}`}
            >
              {currentSong.nombre_artista}
            </Link>
          ) : (
            <span className="player-now-artist">
              {currentSong.nombre_artista || t('track.unknownArtist')}
            </span>
          )}
        </div>
      </div>

      <div className="player-center">
        <div className="player-buttons">
          <button
            type="button"
            className={`toggle-btn${isShuffle ? ' is-active' : ''}`}
            onClick={toggleShuffle}
            aria-pressed={isShuffle}
            aria-label={t('player.shuffle')}
            title={t('player.shuffle')}
          >
            <ShuffleIcon size={18} />
          </button>

          <button
            type="button"
            className="toggle-btn"
            onClick={prev}
            aria-label={t('player.previous')}
            title={t('player.previous')}
          >
            <PrevIcon size={18} />
          </button>

          <button
            type="button"
            className="play-button play-button--sm"
            onClick={togglePlay}
            disabled={!hasAudio}
            aria-label={isPlaying ? t('player.pause') : t('player.play')}
            title={
              hasAudio
                ? isPlaying
                  ? t('player.pause')
                  : t('player.play')
                : t('player.noAudio')
            }
          >
            {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          </button>

          <button
            type="button"
            className="toggle-btn"
            onClick={next}
            aria-label={t('player.next')}
            title={t('player.next')}
          >
            <NextIcon size={18} />
          </button>

          <button
            type="button"
            className={`toggle-btn${repeatMode > 0 ? ' is-active' : ''}`}
            onClick={toggleRepeat}
            aria-label={t('player.repeat')}
            title={
              repeatMode === 0
                ? t('player.repeatOff')
                : repeatMode === 1
                  ? t('player.repeatAll')
                  : t('player.repeatOne')
            }
          >
            <RepeatIcon size={18} />
          </button>
        </div>

        <div className="player-seek">
          <span className="player-time">{formatDuration(progress)}</span>
          <Slider
            value={progress}
            max={duration || 0}
            step={1}
            label={t('player.progress')}
            valueText={`${formatDuration(progress)} / ${formatDuration(duration)}`}
            onChange={seekTo}
          />
          <span className="player-time">
            {duration ? formatDuration(duration) : '--:--'}
          </span>
        </div>
      </div>

      <div className="player-extra">
        <button
          type="button"
          className="toggle-btn"
          aria-label={t('player.queue')}
          title={t('player.queue')}
          aria-pressed={queueOpen}
          onClick={onToggleQueue}
        >
          <QueueIcon size={18} />
        </button>

        <div className="player-volume">
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
            aria-label={volume === 0 ? t('player.unmute') : t('player.mute')}
            title={volume === 0 ? t('player.unmute') : t('player.mute')}
          >
            <VolumeIcon size={18} level={volumeLevel} />
          </button>
          <Slider
            value={volume}
            max={1}
            green
            label={t('player.volume')}
            valueText={`${Math.round(volume * 100)}%`}
            onChange={setVolume}
          />
        </div>
      </div>
    </footer>
  );
}
