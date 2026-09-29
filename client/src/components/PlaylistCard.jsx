import React from 'react';
import { Link } from 'react-router-dom';

function PlaylistCard({ playlist }) {
    return (
        <div className="col-md-4 col-lg-3 mb-4">
            <div className="card h-100 bg-secondary border-0">
                <div className="card-body">
                    <h5 className="card-title text-white">{playlist.nombre_playlist}</h5>
                    <p className="card-text text-light small">
                        {playlist.descripcion || 'Sin descripción'}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-dark">
                            <i className="fas fa-music me-1"></i>
                            {playlist.total_canciones || 0} canciones
                        </span>
                        <span className={`badge ${playlist.privada ? 'bg-warning text-dark' : 'bg-success'}`}>
                            {playlist.privada ? 'Privada' : 'Pública'}
                        </span>
                    </div>
                    <Link
                        to={`/playlists/${playlist.id_playlist}`}
                        className="btn btn-outline-success btn-sm w-100 mt-3"
                    >
                        <i className="fas fa-play me-1"></i>Ver Playlist
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PlaylistCard;
