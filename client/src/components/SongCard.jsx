import React from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCurrentSong = currentSong && currentSong.id_cancion === song.id_cancion;

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <div className="col">
      <div className="card h-100 bg-secondary bg-opacity-25 border-secondary text-white song-card">
        {song.portada_album ? (
          <img
            src={`/uploads/images/${song.portada_album}`}
            className="card-img-top"
            alt={song.titulo}
            style={{ height: '180px', objectFit: 'cover' }}
          />
        ) : (
          <div className="card-img-top bg-dark d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
            <i className="fas fa-music fa-2x text-secondary"></i>
          </div>
        )}
        <div className="card-body">
          <h6 className="card-title text-truncate">{song.titulo}</h6>
          <p className="card-text small text-muted mb-1">
            {song.nombre_artista || 'Unknown Artist'}
          </p>
          <p className="card-text small text-muted">
            {song.titulo_album || 'Unknown Album'}
          </p>
        </div>
        <div className="card-footer bg-transparent border-secondary d-flex justify-content-between align-items-center">
          <small className="text-muted">{formatDuration(song.duracion)}</small>
          <button
            onClick={handlePlay}
            className={`btn btn-sm ${isCurrentSong && isPlaying ? 'btn-success' : 'btn-outline-success'}`}
          >
            <i className={`fas ${isCurrentSong && isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
}
