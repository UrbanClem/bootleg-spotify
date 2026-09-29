import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import Artwork from './Artwork';
import { CloseIcon, MusicIcon } from './icons';

function QueueEntry({ song, index, playing, onSelect }) {
  return (
    <button
      type="button"
      className={`queue-item${playing ? ' is-current' : ''}`}
      onClick={() => onSelect(index)}
    >
      <div className="queue-item-art">
        <Artwork
          src={song.portada_album ? `/uploads/images/${song.portada_album}` : null}
          alt=""
          seed={song.id_album ?? song.titulo}
          icon={MusicIcon}
        />
      </div>
      <div className="queue-item-meta">
        <span className="queue-item-title" title={song.titulo}>
          {song.titulo}
        </span>
        <span className="queue-item-artist">{song.nombre_artista || '—'}</span>
      </div>
    </button>
  );
}

export default function QueuePanel({ onClose }) {
  const { currentSong, queue, currentIndex, playAt } = usePlayer();

  const upcoming = queue.filter((_, i) => i !== currentIndex);

  return (
    <aside className="queue-panel" aria-label="Cola de reproducción">
      <div className="queue-panel-head">
        <span>Cola</span>
        <button
          type="button"
          className="toggle-btn"
          onClick={onClose}
          aria-label="Cerrar cola"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      <div className="queue-panel-body">
        <div className="queue-section-title">Reproduciendo ahora</div>

        {currentSong ? (
          <div className="queue-now">
            <div className="queue-now-art">
              <Artwork
                src={
                  currentSong.portada_album
                    ? `/uploads/images/${currentSong.portada_album}`
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
                {currentSong.nombre_artista || '—'}
              </span>
            )}
          </div>
        ) : (
          <p className="queue-empty">No hay nada reproduciéndose.</p>
        )}

        <div className="queue-section-title">A continuación</div>

        {upcoming.length === 0 ? (
          <p className="queue-empty">
            La cola está vacía. Añade canciones desde cualquier lista.
          </p>
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
