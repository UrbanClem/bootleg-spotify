import { useState, useEffect, useContext } from 'react';
import axios from '../../api';
import Layout from '../../components/Layout';
import ArtistCard from '../../components/ArtistCard';
import { AuthContext } from '../../context/AuthContext';

const AdminArtists = () => {
    const { user } = useContext(AuthContext);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [formData, setFormData] = useState({
        nombre_artista: '',
        biografia: '',
        verificado: false,
        foto_perfil: null
    });

    useEffect(() => {
        if (user && user.tipo_cuenta !== 'Admin') {
            setError('Acceso denegado. Se requiere rol de administrador.');
            setLoading(false);
            return;
        }
        fetchArtists();
    }, [user]);

    const fetchArtists = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/artists');
            setArtists(response.data);
        } catch (err) {
            setError('Error al cargar los artistas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este artista?')) return;

        try {
            await axios.delete(`/artists/${id}`);
            setArtists(artists.filter(artist => artist.id_artista !== id));
        } catch (err) {
            setError('Error al eliminar el artista');
        }
    };

    const handleEdit = (artist) => {
        setSelectedArtist(artist);
        setFormData({
            nombre_artista: artist.nombre_artista || '',
            biografia: artist.biografia || '',
            verificado: artist.verificado || false,
            foto_perfil: null
        });
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setFormData({
            nombre_artista: '',
            biografia: '',
            verificado: false,
            foto_perfil: null
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('nombre_artista', formData.nombre_artista);
            data.append('biografia', formData.biografia);
            data.append('verificado', formData.verificado);
            if (formData.foto_perfil) {
                data.append('foto_perfil', formData.foto_perfil);
            }

            if (showEditModal && selectedArtist) {
                await axios.put(`/artists/${selectedArtist.id_artista}`, data);
                setArtists(artists.map(a => a.id_artista === selectedArtist.id_artista ? { ...a, ...formData } : a));
                setShowEditModal(false);
            } else {
                await axios.post('/artists', data);
                fetchArtists();
                setShowAddModal(false);
            }
        } catch (err) {
            setError('Error al guardar el artista');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0] || null
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const renderForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Nombre del Artista</label>
                <input
                    type="text"
                    className="form-control"
                    name="nombre_artista"
                    value={formData.nombre_artista}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Biografía</label>
                <textarea
                    className="form-control"
                    name="biografia"
                    rows="4"
                    value={formData.biografia}
                    onChange={handleChange}
                ></textarea>
            </div>
            <div className="mb-3 form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    name="verificado"
                    checked={formData.verificado}
                    onChange={handleChange}
                    id="verificadoCheck"
                />
                <label className="form-check-label" htmlFor="verificadoCheck">
                    Artista verificado
                </label>
            </div>
            <div className="mb-3">
                <label className="form-label">Foto de Perfil</label>
                <input
                    type="file"
                    className="form-control"
                    name="foto_perfil"
                    onChange={handleChange}
                    accept="image/*"
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
        <Layout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Gestión de Artistas</h1>
                    <button className="btn btn-success" onClick={handleAdd}>
                        Nuevo Artista
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-2 text-muted">Cargando artistas...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {artists.length === 0 ? (
                            <div className="alert alert-info">
                                No hay artistas registrados.
                            </div>
                        ) : (
                            <div className="row g-4">
                                {artists.map(artist => (
                                    <div className="col-md-6 col-lg-4" key={artist.id_artista}>
                                        <div className="position-relative">
                                            <ArtistCard artist={artist} />
                                            <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() => handleEdit(artist)}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(artist.id_artista)}
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
                                    <h5 className="modal-title">Nuevo Artista</h5>
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
                                    <h5 className="modal-title">Editar Artista</h5>
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
        </Layout>
    );
};

export default AdminArtists;
