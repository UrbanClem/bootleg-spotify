import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { usePlayer } from '../context/PlayerContext';

export default function ViewAlbum() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/albums/${id}`);
        setAlbum(response.data);
        setError(null);
      } catch (err) {
        setError('Error loading album. Please try again later.');
        console.error('Error fetching album:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading album...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/albums" className="btn btn-outline-success">
          ← Back to Albums
        </Link>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="container">
        <div className="alert alert-warning" role="alert">
          Album not found.
        </div>
        <Link to="/albums" className="btn btn-outline-success">
          ← Back to Albums
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/albums" className="btn btn-outline-success mb-4">
        ← Back to Albums
      </Link>

      <div className="row mb-4">
        <div className="col-md-4 text-center">
          {album.portada ? (
            <img
              src={`/uploads/images/${album.portada}`}
              className="img-fluid rounded shadow"
              alt={album.titulo}
              style={{ maxWidth: '300px', width: '100%' }}
            />
          ) : (
            <div className="bg-secondary bg-opacity-25 rounded d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
              <i className="fas fa-compact-disc fa-4x text-secondary"></i>
            </div>
          )}
        </div>
        <div className="col-md-8">
          <h1 className="display-4 fw-bold">{album.titulo}</h1>
          <p className="lead">
            Por: <span className="text-success">{album.nombre_artista || 'Unknown Artist'}</span>
          </p>
          <div className="mb-3">
            <span className="badge bg-secondary me-2">{album.genero || 'Unknown Genre'}</span>
            <span className="text-muted">{formatDate(album.fecha_lanzamiento)}</span>
          </div>
          <p className="text-muted">
            {album.canciones?.length || 0} songs
          </p>
        </div>
      </div>

      <div className="card bg-secondary bg-opacity-25 border-secondary text-white">
        <div className="card-header bg-transparent border-secondary">
          <h5 className="mb-0">Track List</h5>
        </div>
        <div className="card-body p-0">
          {album.canciones && album.canciones.length > 0 ? (
            <div className="list-group list-group-flush">
              {album.canciones.map((song, index) => (
                <div
                  key={song.id_cancion}
                  className="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <span className="text-muted me-3" style={{ width: '30px' }}>
                      {index + 1}
                    </span>
                    <div>
                      <span className="me-2">{song.titulo}</span>
                      {song.explicit === 1 && (
                        <span className="badge bg-danger" style={{ fontSize: '0.6rem' }}>E</span>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="text-muted me-3">
                      {formatDuration(song.duracion)}
                    </span>
                    {song.archivo_audio && (
                      <button
                        onClick={() => playSong(song)}
                        className="btn btn-sm btn-outline-success"
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4 mb-0">No songs in this album.</p>
          )}
        </div>
      </div>
    </div>
  );
}
