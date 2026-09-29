import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const Player = () => {
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
    repeatMode,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [localProgress, setLocalProgress] = useState(0);
  const progressRef = useRef(null);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    seekTo(percentage * duration);
  };

  if (!currentSong) return null;

  const coverUrl = currentSong.portada_album
    ? `/uploads/images/${currentSong.portada_album}`
    : null;

  return (
    <div
      className="fixed-bottom d-flex align-items-center px-3 py-2 border-top border-secondary"
      style={{ backgroundColor: '#181818', height: 80, zIndex: 1050 }}
    >
      {/* Song Info */}
      <div className="d-flex align-items-center gap-3" style={{ width: '30%' }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={currentSong.titulo}
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <div
            className="d-flex align-items-center justify-content-center bg-secondary rounded"
            style={{ width: 56, height: 56 }}
          >
            <i className="fas fa-music text-white"></i>
          </div>
        )}
        <div className="text-truncate">
          <div className="text-white small fw-bold text-truncate">
            {currentSong.titulo}
          </div>
          <div className="text-secondary small text-truncate">
            {currentSong.nombre_artista || 'Unknown Artist'}
          </div>
        </div>
      </div>

      {/* Controls & Progress */}
      <div
        className="d-flex flex-column align-items-center"
        style={{ width: '40%' }}
      >
        <div className="d-flex align-items-center gap-3 mb-1">
          <button
            onClick={toggleShuffle}
            className={`btn btn-link p-0 ${isShuffle ? 'text-success' : 'text-secondary'}`}
            title="Shuffle"
          >
            <i className="fas fa-random"></i>
          </button>
          <button
            onClick={prev}
            className="btn btn-link text-secondary p-0"
            title="Anterior"
          >
            <i className="fas fa-step-backward"></i>
          </button>
          <button
            onClick={togglePlay}
            className="btn btn-link text-white p-0"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} fa-lg`}></i>
          </button>
          <button
            onClick={next}
            className="btn btn-link text-secondary p-0"
            title="Siguiente"
          >
            <i className="fas fa-step-forward"></i>
          </button>
          <button
            onClick={toggleRepeat}
            className={`btn btn-link p-0 ${repeatMode > 0 ? 'text-success' : 'text-secondary'}`}
            title={`Repeat: ${repeatMode === 0 ? 'Off' : repeatMode === 1 ? 'All' : 'One'}`}
          >
            <i className={`fas ${repeatMode === 2 ? 'fa-redo' : 'fa-redo'}`}></i>
            {repeatMode === 2 && <span className="badge bg-success ms-1">1</span>}
          </button>
        </div>
        <div className="d-flex align-items-center gap-2 w-100">
          <span className="text-secondary" style={{ fontSize: 11 }}>
            {formatTime(localProgress)}
          </span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-grow-1"
            style={{
              height: 4,
              backgroundColor: '#4d4d4d',
              borderRadius: 2,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: duration ? `${(localProgress / duration) * 100}%` : '0%',
                height: '100%',
                backgroundColor: '#1db954',
                borderRadius: 2,
              }}
            />
          </div>
          <span className="text-secondary" style={{ fontSize: 11 }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div
        className="d-flex align-items-center justify-content-end gap-2"
        style={{ width: '30%' }}
      >
        <i className="fas fa-volume-up text-secondary small"></i>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ width: 100, accentColor: '#1db954' }}
        />
      </div>
    </div>
  );
};

export default Player;
