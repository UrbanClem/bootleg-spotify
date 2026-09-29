import { Link } from 'react-router-dom';
import MediaCard from './MediaCard';
import { CardSkeleton } from './Feedback';

const KIND = {
  album: 'id_album',
  artist: 'id_artista',
  playlist: 'id_playlist',
  song: 'id_cancion',
};

/**
 * A titled row of media cards.
 *
 * Rendered as a fixed-column grid rather than a scroller: with a seeded
 * catalogue of 8–17 items per genre there is never enough content to make a
 * horizontal carousel feel better than a wrapping row.
 */
export default function Shelf({ title, subtitle, to, items = [], kind = 'album', loading, renderItem, onPlay, emptyNote }) {
  if (!loading && items.length === 0) return null;

  // Pick the id column that matches what the shelf is actually showing. A song
  // carries `id_album` and `id_artista` too, so probing the fields in order
  // would hand every track from one album the same React key.
  const idField = KIND[kind];
  const keyFor = (item, i) => item?.[idField] ?? `${kind}-${i}`;

  return (
    <section className="section">
      {(title || to) && (
        <div className="section-head">
          <div>
            <h2 className="section-title">
              {to ? <Link to={to}>{title}</Link> : title}
            </h2>
            {subtitle && <p className="greeting-sub">{subtitle}</p>}
          </div>
          {to && (
            <Link className="section-link" to={to}>
              Mostrar todo
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="shelf">
          {items.map((item, i) =>
            renderItem ? (
              <div key={keyFor(item, i)}>{renderItem(item, i)}</div>
            ) : (
              <MediaCard key={keyFor(item, i)} item={item} kind={kind} onPlay={onPlay} />
            )
          )}
        </div>
      )}

      {!loading && items.length === 0 && emptyNote && (
        <p className="text-subdued" style={{ fontSize: 14 }}>
          {emptyNote}
        </p>
      )}
    </section>
  );
}
