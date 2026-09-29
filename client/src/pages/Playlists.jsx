import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api';
import PlaylistCard from '../components/PlaylistCard';

function Playlists() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre_playlist: '',
        descripcion: '',
        privada: false
    });

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/playlists');
            setPlaylists(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las playlists');
            console.error('Fetch playlists error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/playlists', formData);
            setShowModal(false);
            setFormData({ nombre_playlist: '', descripcion: '', privada: false });
            fetchPlaylists();
        } catch (err) {
            setError('Error al crear la playlist');
            console.error('Create playlist error:', err);
        }
    };

    return (
        <>
          <div className="d-flex justify-content-content-between align-items-center mb-4">
              <h2><i className="fas fa-list me-2"></i>Mis Playlists</h2>
              <button
                  className="btn btn-success"
                  onClick={() => setShowModal(true)}
              >
                  <i className="fas fa-plus me-1"></i>Nueva Playlist
              </button>
          </div>

          {error && (
              <div className="alert alert-danger" role="alert">
                  {error}
              </div>
          )}

          {loading ? (
              <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 text-light">Cargando playlists...</p>
              </div>
          ) : playlists.length === 0 ? (
              <div className="text-center py-5">
                  <i className="fas fa-music fa-3x text-secondary mb-3"></i>
                  <p className="text-light">No tienes playlists aún</p>
                  <button
                      className="btn btn-outline-success"
                      onClick={() => setShowModal(true)}
                  >
                      Crear mi primera playlist
                  </button>
              </div>
          ) : (
              <div className="row">
                  {playlists.map(playlist => (
                      <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
                  ))}
              </div>
          )}

          {/* Modal Nueva Playlist */}
          {showModal && (
              <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                  <div className="modal-dialog">
                      <div className="modal-content bg-dark text-white">
                          <div className="modal-header border-secondary">
                              <h5 className="modal-title">Nueva Playlist</h5>
                              <button
                                  type="button"
                                  className="btn-close btn-close-white"
                                  onClick={() => setShowModal(false)}
                              ></button>
                          </div>
                          <form onSubmit={handleSubmit}>
                              <div className="modal-body">
                                  <div className="mb-3">
                                      <label htmlFor="nombre_playlist" className="form-label">Nombre</label>
                                      <input
                                          type="text"
                                          className="form-control bg-secondary text-white border-secondary"
                                          id="nombre_playlist"
                                          name="nombre_playlist"
                                          value={formData.nombre_playlist}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Nombre de la playlist"
                                      />
                                  </div>
                                  <div className="mb-3">
                                      <label htmlFor="descripcion" className="form-label">Descripción</label>
                                      <textarea
                                          className="form-control bg-secondary text-white border-secondary"
                                          id="descripcion"
                                          name="descripcion"
                                          value={formData.descripcion}
                                          onChange={handleInputChange}
                                          rows="3"
                                          placeholder="Descripción de la playlist"
                                      ></textarea>
                                  </div>
                                  <div className="form-check form-switch">
                                      <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id="privada"
                                          name="privada"
                                          checked={formData.privada}
                                          onChange={handleInputChange}
                                      />
                                      <label className="form-check-label" htmlFor="privada">
                                          Playlist privada
                                      </label>
                                  </div>
                              </div>
                              <div className="modal-footer border-secondary">
                                  <button
                                      type="button"
                                      className="btn btn-outline-secondary"
                                      onClick={() => setShowModal(false)}
                                  >
                                      Cancelar
                                  </button>
                                  <button type="submit" className="btn btn-success">
                                      <i className="fas fa-plus me-1"></i>Crear
                                  </button>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
          )}
        </>
    );
}

export default Playlists;
