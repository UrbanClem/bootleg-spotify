import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api';
import { usePlayer } from '../context/PlayerContext';

function PlaylistDetail() {
    const { id } = useParams();
    const { playSong, currentSong, isPlaying } = usePlayer();
    const [playlist, setPlaylist] = useState(null);
    const [allSongs, setAllSongs] = useState([]);
    const [selectedSong, setSelectedSong] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlaylist();
        fetchAllSongs();
    }, [id]);

    const fetchPlaylist = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/playlists/${id}`);
            setPlaylist(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar la playlist');
            console.error('Fetch playlist error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSongs = async () => {
        try {
            const response = await axios.get('/songs');
            setAllSongs(response.data);
        } catch (err) {
            console.error('Fetch songs error:', err);
        }
    };

    const handleAddSong = async () => {
        if (!selectedSong) return;
        try {
            await axios.post(`/playlists/${id}/songs`, { id_cancion: parseInt(selectedSong) });
            setSelectedSong('');
            fetchPlaylist();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al agregar la canción');
            console.error('Add song error:', err);
        }
    };

    const handleRemoveSong = async (songId) => {
        try {
            await axios.delete(`/playlists/${id}/songs/${songId}`);
            fetchPlaylist();
        } catch (err) {
            setError('Error al remover la canción');
            console.error('Remove song error:', err);
        }
    };

    const handlePlaySong = (song) => {
        playSong(song);
    };

    const isCurrentSong = (songId) => currentSong && currentSong.id_cancion === songId;

    if (loading) {
        return (
              <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 text-light">Cargando playlist...</p>
              </div>
        );
    }

    if (error && !playlist) {
        return (
            <>
              <div className="alert alert-danger" role="alert">
                  {error}
              </div>
              <Link to="/playlists" className="btn btn-outline-light">
                  <i className="fas fa-arrow-left me-1"></i>Volver a Playlists
              </Link>
            </>
        );
    }

    if (!playlist) return null;

    return (
        <>
          <Link to="/playlists" className="btn btn-outline-light btn-sm mb-3">
              <i className="fas fa-arrow-left me-1"></i>Volver
          </Link>

          <div className="d-flex justify-content-content-between align-items-start mb-4">
              <div>
                  <h2 className="text-white">{playlist.nombre_playlist}</h2>
                  <p className="text-light mb-1">{playlist.descripcion || 'Sin descripción'}</p>
                  <div className="d-flex gap-2">
                      <span className="badge bg-dark">
                          <i className="fas fa-music me-1"></i>
                          {playlist.canciones?.length || 0} canciones
                      </span>
                      <span className={`badge ${playlist.privada ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {playlist.privada ? 'Privada' : 'Pública'}
                      </span>
                  </div>
              </div>
          </div>

          {error && (
              <div className="alert alert-danger" role="alert">
                  {error}
              </div>
          )}

          {/* Agregar Canción */}
          <div className="card bg-secondary border-0 mb-4">
              <div className="card-body">
                  <h5 className="card-title text-white">
                      <i className="fas fa-plus-circle me-2"></i>Agregar Canción
                  </h5>
                  <div className="row g-2">
                      <div className="col-md-8">
                          <select
                              className="form-select bg-dark text-white border-secondary"
                              value={selectedSong}
                              onChange={(e) => setSelectedSong(e.target.value)}
                          >
                              <option value="">Seleccionar canción...</option>
                              {allSongs.map(song => (
                                  <option key={song.id_cancion} value={song.id_cancion}>
                                      {song.titulo} - {song.nombre_artista}
                                  </option>
                              ))}
                          </select>
                      </div>
                      <div className="col-md-4">
                          <button
                              className="btn btn-success w-100"
                              onClick={handleAddSong}
                              disabled={!selectedSong}
                          >
                              <i className="fas fa-plus me-1"></i>Agregar
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* Lista de Canciones */}
          {playlist.canciones && playlist.canciones.length > 0 ? (
              <div className="list-group">
                  {playlist.canciones.map((song, index) => (
                      <div
                          key={song.id_cancion}
                          className={`list-group-item d-flex justify-content-content-between align-items-center bg-dark text-white border-secondary ${isCurrentSong(song.id_cancion) ? 'border-success border-2' : ''}`}
                      >
                          <div className="d-flex align-items-center">
                              <span className="me-3 text-secondary">{index + 1}</span>
                              <div>
                                  <div className="fw-bold">
                                      {song.titulo}
                                      {isCurrentSong(song.id_cancion) && (
                                          <i className="fas fa-volume-up text-success ms-2"></i>
                                      )}
                                  </div>
                                  <small className="text-secondary">
                                      {song.nombre_artista} {song.titulo_album && `• ${song.titulo_album}`}
                                  </small>
                              </div>
                          </div>
                          <div className="d-flex gap-2">
                              <button
                                  className={`btn btn-sm ${isCurrentSong(song.id_cancion) && isPlaying ? 'btn-success' : 'btn-outline-success'}`}
                                  onClick={() => handlePlaySong(song)}
                              >
                                  <i className={`fas ${isCurrentSong(song.id_cancion) && isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                              </button>
                              <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveSong(song.id_cancion)}
                              >
                                  <i className="fas fa-trash"></i>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-center py-5">
                  <i className="fas fa-music fa-3x text-secondary mb-3"></i>
                  <p className="text-light">Esta playlist está vacía</p>
                  <p className="text-secondary small">Agrega canciones usando el formulario de arriba</p>
              </div>
          )}
        </>
    );
}

export default PlaylistDetail;
