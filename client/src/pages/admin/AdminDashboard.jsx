import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        songs: 0,
        albums: 0,
        artists: 0,
        users: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [songsRes, albumsRes, artistsRes, usersRes] = await Promise.all([
                    axios.get('/songs'),
                    axios.get('/albums'),
                    axios.get('/artists'),
                    axios.get('/users')
                ]);
                setStats({
                    songs: songsRes.data.length,
                    albums: albumsRes.data.length,
                    artists: artistsRes.data.length,
                    users: usersRes.data.length
                });
            } catch (err) {
                setError('Error al cargar las estadísticas');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const sections = [
        { title: 'Canciones', path: '/admin/songs', count: stats.songs, icon: '🎵' },
        { title: 'Álbumes', path: '/admin/albums', count: stats.albums, icon: '💿' },
        { title: 'Artistas', path: '/admin/artists', count: stats.artists, icon: '🎤' },
        { title: 'Usuarios', path: '/admin/users', count: stats.users, icon: '👥' }
    ];

    return (
        <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Panel de Administración</h1>
                    <span className="badge bg-success fs-6">Admin</span>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-2 text-muted">Cargando dashboard...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="card bg-dark text-white mb-4">
                            <div className="card-body">
                                <h4 className="card-title">Bienvenido, {user?.nombre}</h4>
                                <p className="card-text mb-0">
                                    Tipo de cuenta: <span className="badge bg-info">{user?.tipo_cuenta}</span>
                                </p>
                            </div>
                        </div>

                        <div className="row g-4 mb-4">
                            {sections.map((section) => (
                                <div className="col-md-6 col-lg-3" key={section.path}>
                                    <div className="card bg-dark text-white h-100">
                                        <div className="card-body text-center">
                                            <div className="fs-1 mb-2">{section.icon}</div>
                                            <h5 className="card-title">{section.title}</h5>
                                            <p className="card-text display-6">{section.count}</p>
                                            <Link to={section.path} className="btn btn-success btn-sm">
                                                Gestionar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card bg-dark text-white">
                            <div className="card-body">
                                <h5 className="card-title">Información de la Cuenta</h5>
                                <table className="table table-dark table-borderless mb-0">
                                    <tbody>
                                        <tr>
                                            <td className="text-muted">Nombre:</td>
                                            <td>{user?.nombre}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">Email:</td>
                                            <td>{user?.email}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">Tipo de cuenta:</td>
                                            <td>{user?.tipo_cuenta}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">Fecha de registro:</td>
                                            <td>{user?.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">País:</td>
                                            <td>{user?.pais || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">Saldo:</td>
                                            <td>${user?.saldo ? parseFloat(user.saldo).toFixed(2) : '0.00'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboard;
