import React from 'react';

export default function ArtistCard({ artist }) {
  return (
    <div className="col">
      <div className="card h-100 bg-secondary bg-opacity-25 border-secondary text-white artist-card">
        {artist.foto_perfil ? (
          <img
            src={`/uploads/artists/${artist.foto_perfil}`}
            className="card-img-top"
            alt={artist.nombre_artista}
            style={{ height: '180px', objectFit: 'cover' }}
          />
        ) : (
          <div className="card-img-top bg-dark d-flex align-items-center justify-center" style={{ height: '180px' }}>
            <i className="fas fa-user fa-2x text-secondary"></i>
          </div>
        )}
        <div className="card-body">
          <h6 className="card-title text-truncate">
            {artist.nombre_artista}
            {artist.verificado === 1 && (
              <span className="badge bg-success ms-2">
                <i className="fas fa-check"></i>
              </span>
            )}
          </h6>
          <p className="card-text small text-muted">
            <i className="fas fa-users me-1"></i>{artist.seguidores || 0} seguidores
          </p>
          <p className="card-text small text-muted">
            <i className="fas fa-music me-1"></i>{artist.total_canciones || 0} canciones
          </p>
        </div>
      </div>
    </div>
  );
}
