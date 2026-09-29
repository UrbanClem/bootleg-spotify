import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-2 sidebar bg-black min-vh-100 p-3" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, overflowY: 'auto' }}>
                    <h4 className="mb-4 text-white">
                        <i className="fas fa-music me-2 text-success"></i>MusicStream
                    </h4>
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/" end>
                                <i className="fas fa-home me-2"></i>Inicio
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/songs">
                                <i className="fas fa-music me-2"></i>Canciones
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/albums">
                                <i className="fas fa-compact-disc me-2"></i>Álbumes
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/artists">
                                <i className="fas fa-microphone me-2"></i>Artistas
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/playlists">
                                <i className="fas fa-list me-2"></i>Mis Playlists
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/search">
                                <i className="fas fa-search me-2"></i>Buscar
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/profile">
                                <i className="fas fa-user me-2"></i>Mi Perfil
                            </NavLink>
                        </li>
                        {isAdmin && (
                            <>
                                <li className="nav-item mt-3">
                                    <span className="text-muted small ms-2">ADMINISTRACIÓN</span>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/admin">
                                        <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/admin/songs">
                                        <i className="fas fa-music me-2"></i>Gestionar Canciones
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/admin/albums">
                                        <i className="fas fa-compact-disc me-2"></i>Gestionar Álbumes
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/admin/artists">
                                        <i className="fas fa-microphone me-2"></i>Gestionar Artistas
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/admin/users">
                                        <i className="fas fa-users me-2"></i>Gestionar Usuarios
                                    </NavLink>
                                </li>
                            </>
                        )}
                        <li className="nav-item mt-3">
                            <button className="nav-link btn btn-link text-danger" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="col-md-10 main-content" style={{ marginLeft: '16.666667%', padding: '20px', paddingBottom: '100px' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Layout;
