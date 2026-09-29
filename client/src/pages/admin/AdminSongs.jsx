import { useState, useEffect, useContext } from 'react';
import axios from '../../api';
import SongCard from '../../components/SongCard';
import { AuthContext } from '../../context/AuthContext';

const AdminSongs = () => {
    const { user } = useContext(AuthContext);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        duracion: '',
        id_artista: '',
        id_album: '',
        fecha_lanzamiento: '',
        explicit: false
    });
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        if (user && user.tipo_cuenta !== 'Admin') {
            setError('Acceso denegado. Se requiere rol de administrador.');
            setLoading(false);
            return;
        }
        fetchSongs();
        fetchArtistsAndAlbums();
    }, [user]);

    const fetchSongs = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/songs');
            setSongs(response.data);
        } catch (err) {
            setError('Error al cargar las canciones');
        } finally {
            setLoading(false);
        }
    };

    const fetchArtistsAndAlbums = async () => {
        try {
            const [artistsRes, albumsRes] = await Promise.all([
                axios.get('/artists'),
                axios.get('/albums')
            ]);
            setArtists(artistsRes.data);
            setAlbums(albumsRes.data);
        } catch (err) {
            console.error('Error al cargar artistas y álbumes:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta canción?')) return;

        try {
            await axios.delete(`/songs/${id}`);
            setSongs(songs.filter(song => song.id_cancion !== id));
        } catch (err) {
            setError('Error al eliminar la canción');
        }
    };

    const handleEdit = (song) => {
        setSelectedSong(song);
        setFormData({
            titulo: song.titulo || '',
            duracion: song.duracion || '',
            id_artista: song.id_artista || '',
            id_album: song.id_album || '',
            fecha_lanzamiento: song.fecha_lanzamiento ? song.fecha_lanzamiento.split('T')[0] : '',
            explicit: song.explicit || false
        });
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setFormData({
            titulo: '',
            duracion: '',
            id_artista: '',
            id_album: '',
            fecha_lanzamiento: '',
            explicit: false
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (showEditModal && selectedSong) {
                await axios.put(`/songs/${selectedSong.id_cancion}`, formData);
                setSongs(songs.map(s => s.id_cancion === selectedSong.id_cancion ? { ...s, ...formData } : s));
                setShowEditModal(false);
            } else {
                await axios.post('/songs', formData);
                fetchSongs();
                setShowAddModal(false);
            }
        } catch (err) {
            setError('Error al guardar la canción');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const renderForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Título</label>
                <input
                    type="text"
                    className="form-control"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Duración (segundos)</label>
                <input
                    type="number"
                    className="form-control"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Artista</label>
                <select
                    className="form-select"
                    name="id_artista"
                    value={formData.id_artista}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccionar artista</option>
                    {artists.map(artist => (
                        <option key={artist.id_artista} value={artist.id_artista}>
                            {artist.nombre_artista}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Álbum</label>
                <select
                    className="form-select"
                    name="id_album"
                    value={formData.id_album}
                    onChange={handleChange}
                >
                    <option value="">Sin álbum</option>
                    {albums.map(album => (
                        <option key={album.id_album} value={album.id_album}>
                            {album.titulo}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Fecha de lanzamiento</label>
                <input
                    type="date"
                    className="form-control"
                    name="fecha_lanzamiento"
                    value={formData.fecha_lanzamiento}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3 form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    name="explicit"
                    checked={formData.explicit}
                    onChange={handleChange}
                    id="explicitCheck"
                />
                <label className="form-check-label" htmlFor="explicitCheck">
                    Contenido explícito
                </label>
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                    }}
                >
                    Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                    {showEditModal ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );

    return (
          <div className="container py-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1>Gestión de Canciones</h1>
                  <button className="btn btn-success" onClick={handleAdd}>
                      Agregar Nueva Canción
                  </button>
              </div>

              {loading && (
                  <div className="text-center py-5">
                      <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mt-2 text-muted">Cargando canciones...</p>
                  </div>
              )}

              {error && (
                  <div className="alert alert-danger" role="alert">
                      {error}
                  </div>
              )}

              {!loading && !error && (
                  <>
                      {songs.length === 0 ? (
                          <div className="alert alert-info">
                              No hay canciones registradas.
                          </div>
                      ) : (
                          <div className="row g-4">
                              {songs.map(song => (
                                  <div className="col-md-6 col-lg-4" key={song.id_cancion}>
                                      <div className="position-relative">
                                          <SongCard song={song} />
                                          <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                                              <button
                                                  className="btn btn-sm btn-warning"
                                                  onClick={() => handleEdit(song)}
                                                  title="Editar"
                                              >
                                                  ✏️
                                              </button>
                                              <button
                                                  className="btn btn-sm btn-danger"
                                                  onClick={() => handleDelete(song.id_cancion)}
                                                  title="Eliminar"
                                              >
                                                  🗑️
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </>
              )}

              {/* Add Modal */}
              {showAddModal && (
                  <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog">
                          <div className="modal-content bg-dark text-white">
                              <div className="modal-header">
                                  <h5 className="modal-title">Agregar Nueva Canción</h5>
                                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                              </div>
                              <div className="modal-body">
                                  {renderForm()}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Edit Modal */}
              {showEditModal && (
                  <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog">
                          <div className="modal-content bg-dark text-white">
                              <div className="modal-header">
                                  <h5 className="modal-title">Editar Canción</h5>
                                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                              </div>
                              <div className="modal-body">
                                  {renderForm()}
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
    );
};

export default AdminSongs;
