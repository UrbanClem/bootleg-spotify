import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useI18n } from '../i18n';
import Artwork from './Artwork';
import { PlayIcon, PauseIcon, ArtistIcon, PlaylistIcon, AlbumIcon } from './icons';

const KIND = {
  album: { to: (a) => `/albums/${a.id_album}`, icon: AlbumIcon, kind: 'album' },
  artist: { to: (a) => `/artists/${a.id_artista}`, icon: ArtistIcon, kind: 'artista' },
  playlist: { to: (p) => `/playlists/${p.id_playlist}`, icon: PlaylistIcon, kind: 'playlist' },
};

/**
 * Square media card — the building block of every Spotify grid.
 *
 * `onPlay` enables the floating play button; without it the card is purely
 * navigational (artists have nothing to preview).
 */
export default function MediaCard({
  item,
  kind = 'album',
  title,
  subtitle,
  seed,
  verified = false,
  onPlay,
  badge = false,
}) {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const { t } = useI18n();
  const config = KIND[kind] ?? KIND.album;

  const label = title ?? item?.titulo ?? item?.nombre_artista ?? item?.nombre_playlist ?? '';
  const sub = subtitle ?? item?.nombre_artista ?? '';
  const art = item?.portada ?? item?.foto_perfil ?? null;
  const artUrl = art ? `/uploads/${kind === 'artist' ? 'artists' : 'images'}/${art}` : null;
  const key = seed ?? `${kind}-${item?.id_album ?? item?.id_artista ?? item?.id_playlist ?? label}`;

  const isCurrent = currentSong && item?.id_cancion === currentSong.id_cancion;
  const showingPause = isCurrent && isPlaying;

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) togglePlay();
    else playSong(item);
  };

  return (
    <div className="card">
      <a
        href={config.to(item)}
        onClick={(e) => {
          e.preventDefault();
          navigate(config.to(item));
        }}
      >
        <div className="card-artwork-wrap">
          <Artwork
            src={artUrl}
            alt={label}
            seed={key}
            icon={config.icon}
          />
          {badge && (
            <span className="card-badge" title={t('card.verified')}>
              <config.icon size={12} />
            </span>
          )}
        </div>
        <div className="card-body">
          <div className="card-title" title={label}>
            {label}
          </div>
          {verified && <span className="sr-only">{t('card.verifiedArtist')}</span>}
          {sub && (
            <div className="card-subtitle" title={sub}>
              {sub}
            </div>
          )}
        </div>
      </a>

      {onPlay && (
        <button
          type="button"
          className="card-play"
          onClick={handlePlay}
          aria-label={showingPause ? t('card.pause', { title: label }) : t('card.play', { title: label })}
        >
          {showingPause ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </button>
      )}
    </div>
  );
}
