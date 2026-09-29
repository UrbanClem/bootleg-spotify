import React from 'react';
import { Link } from 'react-router-dom';

export default function AlbumCard({ album }) {
  return (
    <div className="col">
      <div className="card h-100 bg-secondary bg-opacity-25 border-secondary text-white album-card">
        {album.portada ? (
          <img
            src={`/uploads/images/${album.portada}`}
            className="card-img-top"
            alt={album.titulo}
            style={{ height: '180px', objectFit: 'cover' }}
          />
        ) : (
          <div className="card-img-top bg-dark d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
            <i className="fas fa-compact-disc fa-2x text-secondary"></i>
          </div>
        )}
        <div className="card-body">
          <h6 className="card-title text-truncate">{album.titulo}</h6>
          <p className="card-text small text-muted mb-1">
            {album.nombre_artista || 'Unknown Artist'}
          </p>
          <p className="card-text small text-muted">
            {album.fecha_lanzamiento
              ? new Date(album.fecha_lanzamiento).toLocaleDateString()
              : 'Unknown Date'}
          </p>
        </div>
        <div className="card-footer bg-transparent border-secondary d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {album.total_canciones || 0} songs
          </small>
          <Link to={`/albums/${album.id_album}`} className="btn btn-sm btn-outline-success">
            <i className="fas fa-eye me-1"></i>Ver
          </Link>
        </div>
      </div>
    </div>
  );
}
