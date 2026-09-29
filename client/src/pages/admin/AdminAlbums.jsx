import { useState, useEffect, useContext } from 'react';
import axios from '../../api';
import AlbumCard from '../../components/AlbumCard';
import { AuthContext } from '../../context/AuthContext';

const AdminAlbums = () => {
    const { user } = useContext(AuthContext);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        id_artista: '',
        fecha_lanzamiento: '',
        genero: ''
    });
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        if (user && user.tipo_cuenta !== 'Admin') {
            setError('Acceso denegado. Se requiere rol de administrador.');
            setLoading(false);
            return;
        }
        fetchAlbums();
        fetchArtists();
    }, [user]);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/albums');
            setAlbums(response.data);
        } catch (err) {
            setError('Error al cargar los álbumes');
        } finally {
            setLoading(false);
        }
    };

    const fetchArtists = async () => {
        try {
            const response = await axios.get('/artists');
            setArtists(response.data);
        } catch (err) {
            console.error('Error al cargar artistas:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este álbum?')) return;

        try {
            await axios.delete(`/albums/${id}`);
            setAlbums(albums.filter(album => album.id_album !== id));
        } catch (err) {
            setError('Error al eliminar el álbum');
        }
    };

    const handleEdit = (album) => {
        setSelectedAlbum(album);
        setFormData({
            titulo: album.titulo || '',
            id_artista: album.id_artista || '',
            fecha_lanzamiento: album.fecha_lanzamiento ? album.fecha_lanzamiento.split('T')[0] : '',
            genero: album.genero || ''
        });
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setFormData({
            titulo: '',
            id_artista: '',
            fecha_lanzamiento: '',
            genero: ''
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (showEditModal && selectedAlbum) {
                await axios.put(`/albums/${selectedAlbum.id_album}`, formData);
                setAlbums(albums.map(a => a.id_album === selectedAlbum.id_album ? { ...a, ...formData } : a));
                setShowEditModal(false);
            } else {
                await axios.post('/albums', formData);
                fetchAlbums();
                setShowAddModal(false);
            }
        } catch (err) {
            setError('Error al guardar el álbum');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
                <label className="form-label">Fecha de lanzamiento</label>
                <input
                    type="date"
                    className="form-control"
                    name="fecha_lanzamiento"
                    value={formData.fecha_lanzamiento}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Género</label>
                <input
                    type="text"
                    className="form-control"
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                />
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
                  <h1>Gestión de Álbumes</h1>
                  <button className="btn btn-success" onClick={handleAdd}>
                      Nuevo Álbum
                  </button>
              </div>

              {loading && (
                  <div className="text-center py-5">
                      <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mt-2 text-muted">Cargando álbumes...</p>
                  </div>
              )}

              {error && (
                  <div className="alert alert-danger" role="alert">
                      {error}
                  </div>
              )}

              {!loading && !error && (
                  <>
                      {albums.length === 0 ? (
                          <div className="alert alert-info">
                              No hay álbumes registrados.
                          </div>
                      ) : (
                          <div className="row g-4">
                              {albums.map(album => (
                                  <div className="col-md-6 col-lg-4" key={album.id_album}>
                                      <div className="position-relative">
                                          <AlbumCard album={album} />
                                          <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                                              <button
                                                  className="btn btn-sm btn-warning"
                                                  onClick={() => handleEdit(album)}
                                                  title="Editar"
                                              >
                                                  ✏️
                                              </button>
                                              <button
                                                  className="btn btn-sm btn-danger"
                                                  onClick={() => handleDelete(album.id_album)}
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
                                  <h5 className="modal-title">Nuevo Álbum</h5>
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
                                  <h5 className="modal-title">Editar Álbum</h5>
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

export default AdminAlbums;
