import { useState } from 'react';
import { MusicIcon } from './icons';
import { coverStyle } from '../utils';

/**
 * Square artwork with a deterministic gradient fallback.
 *
 * Every seeded album has `portada: null`, so the placeholder is not a nicety —
 * without it the whole catalogue renders as empty grey boxes. The gradient is
 * derived from `seed`, so a given album always looks the same across pages.
 */
export default function Artwork({
  src,
  alt = '',
  seed = 'default',
  round = false,
  className = '',
  icon: Icon = MusicIcon,
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  const classes = ['artwork', round && 'artwork--round', !showImage && 'artwork--fallback', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={coverStyle(seed)}>
      {showImage ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <Icon aria-hidden="true" />
      )}
    </div>
  );
}
