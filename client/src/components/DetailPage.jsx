import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Artwork from './Artwork';
import {
  PlayIcon,
  PauseIcon,
  CheckIcon,
  ShareIcon,
  VerifiedIcon,
} from './icons';

/**
 * Header block shared by the album, artist and playlist pages.
 *
 * `tint` is a CSS gradient chosen deterministically from the entity id, so each
 * page keeps a stable colour identity without needing real cover art.
 */
export function DetailHero({
  kindLabel,
  title,
  tint,
  art,
  artAlt,
  round = false,
  meta,
  note,
}) {
  return (
    <header className="hero" style={{ '--hero-tint': tint }}>
      <div className={`hero-art${round ? ' hero-art--round' : ''}`}>
        <Artwork src={art} alt={artAlt ?? title} seed={tint} round={round} />
      </div>
      <div className="hero-meta">
        <span className="hero-kind">{kindLabel}</span>
        <h1 className="hero-title">{title}</h1>
        {meta && <div className="hero-sub">{meta}</div>}
        {note && <p className="hero-note">{note}</p>}
      </div>
    </header>
  );
}

/**
 * Play/pause plus the secondary action row, as on Spotify detail pages.
 *
 * Only controls that actually do something are rendered. A "Me gusta" heart
 * used to sit here, but the schema has no favourites table, so it could never
 * change state - an inert heart reads as a broken app, not an unfinished one.
 * Pages that need their own menu (rename, delete, ...) pass it as `children`.
 */
export function DetailActions({ onPlay, isPlaying, hasAudio, children }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API needs a secure context; fall back to the old trick.
      const field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      document.body.removeChild(field);
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="detail-bar">
      <button
        type="button"
        className="play-button play-button--lg"
        onClick={onPlay}
        disabled={!hasAudio}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        title={hasAudio ? undefined : 'Este contenido aún no tiene audio cargado'}
      >
        {isPlaying ? <PauseIcon size={26} /> : <PlayIcon size={26} />}
      </button>

      <button
        type="button"
        className={`toggle-btn${copied ? ' is-active' : ''}`}
        onClick={share}
        aria-label={copied ? 'Enlace copiado' : 'Compartir'}
        title={copied ? 'Enlace copiado' : 'Copiar enlace'}
      >
        {copied ? <CheckIcon size={26} /> : <ShareIcon size={26} />}
      </button>

      {children}
    </div>
  );
}

/** Small stat line under the action bar ("12 canciones · 38 min"). */
export function DetailStats({ children }) {
  if (!children) return null;
  return <div className="detail-stats">{children}</div>;
}

/** Artist link + verified tick, reused in every hero meta row. */
export function ArtistMeta({ id, name }) {
  if (!name) return null;
  return (
    <>
      {id ? (
        <Link className="hero-artist" to={`/artists/${id}`}>
          {name}
        </Link>
      ) : (
        <span className="hero-artist">{name}</span>
      )}
      <VerifiedIcon size={14} />
      <span className="dot">•</span>
    </>
  );
}
