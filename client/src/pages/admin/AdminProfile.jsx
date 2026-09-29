import { useState, useEffect, useContext } from 'react';
import axios from '../../api';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';

const AdminProfile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        fecha_nacimiento: '',
        pais: ''
    });

    useEffect(() => {
        if (user && user.tipo_cuenta !== 'Admin') {
            setError('Acceso denegado. Se requiere rol de administrador.');
            setLoading(false);
            return;
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/auth/me');
            const userData = response.data;
            setFormData({
                nombre: userData.nombre || '',
                email: userData.email || '',
                fecha_nacimiento: userData.fecha_nacimiento ? userData.fecha_nacimiento.split('T')[0] : '',
                pais: userData.pais || ''
            });
        } catch (err) {
            setError('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await axios.put(`/users/${user.id_usuario}`, formData);

            if (response.data) {
                setSuccess('Perfil actualizado exitosamente');
                if (setUser) {
                    setUser(prev => ({ ...prev, ...formData }));
                }
            }
        } catch (err) {
            setError('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="container py-4">
                <h1 className="mb-4">Mi Perfil de Administrador</h1>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-2 text-muted">Cargando perfil...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success" role="alert">
                        {success}
                    </div>
                )}

                {!loading && !error && (
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="card bg-dark text-white">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Editar Perfil</h5>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Nombre</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Fecha de Nacimiento</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="fecha_nacimiento"
                                                value={formData.fecha_nacimiento}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">País</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="pais"
                                                value={formData.pais}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Guardando...
                                                </>
                                            ) : (
                                                'Guardar Cambios'
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card bg-dark text-white">
                                <div className="card-body text-center">
                                    <div className="mb-3">
                                        <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                                            <span className="display-4">👤</span>
                                        </div>
                                    </div>
                                    <h5>{formData.nombre}</h5>
                                    <p className="text-muted">{formData.email}</p>
                                    <span className="badge bg-danger">Administrador</span>
                                </div>
                            </div>

                            <div className="card bg-dark text-white mt-3">
                                <div className="card-body">
                                    <h6 className="card-title">Información de la Cuenta</h6>
                                    <table className="table table-dark table-borderless mb-0">
                                        <tbody>
                                            <tr>
                                                <td className="text-muted">Tipo de cuenta:</td>
                                                <td><span className="badge bg-danger">Admin</span></td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Fecha de registro:</td>
                                                <td>{user?.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Saldo:</td>
                                                <td>${user?.saldo ? parseFloat(user.saldo).toFixed(2) : '0.00'}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Última conexión:</td>
                                                <td>{user?.ultima_conexion ? new Date(user.ultima_conexion).toLocaleDateString() : 'N/A'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminProfile;
