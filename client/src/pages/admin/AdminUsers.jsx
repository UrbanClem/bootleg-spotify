import { useState, useEffect, useContext } from 'react';
import axios from '../../api';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';

const AdminUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user && user.tipo_cuenta !== 'Admin') {
            setError('Acceso denegado. Se requiere rol de administrador.');
            setLoading(false);
            return;
        }
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (err) {
            setError('Error al cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

        try {
            await axios.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id_usuario !== id));
        } catch (err) {
            setError('Error al eliminar el usuario');
        }
    };

    const filteredUsers = users.filter(u =>
        u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAccountBadge = (tipo) => {
        const badges = {
            'Admin': 'bg-danger',
            'Premium': 'bg-warning text-dark',
            'Free': 'bg-secondary'
        };
        return badges[tipo] || 'bg-secondary';
    };

    return (
        <Layout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Gestión de Usuarios</h1>
                    <span className="badge bg-primary fs-6">{users.length} usuarios</span>
                </div>

                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-2 text-muted">Cargando usuarios...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {filteredUsers.length === 0 ? (
                            <div className="alert alert-info">
                                No se encontraron usuarios.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-dark table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Email</th>
                                            <th>Tipo</th>
                                            <th>País</th>
                                            <th>Saldo</th>
                                            <th>Registro</th>
                                            <th>Última Conexión</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id_usuario}>
                                                <td>{u.id_usuario}</td>
                                                <td>{u.nombre}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`badge ${getAccountBadge(u.tipo_cuenta)}`}>
                                                        {u.tipo_cuenta}
                                                    </span>
                                                </td>
                                                <td>{u.pais || 'N/A'}</td>
                                                <td>${u.saldo ? parseFloat(u.saldo).toFixed(2) : '0.00'}</td>
                                                <td>{u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString() : 'N/A'}</td>
                                                <td>{u.ultima_conexion ? new Date(u.ultima_conexion).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(u.id_usuario)}
                                                        title="Eliminar usuario"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default AdminUsers;
