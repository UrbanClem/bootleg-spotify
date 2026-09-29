import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const cards = [
    { title: 'Playlists', icon: '📋', link: '/playlists', description: 'Your music collections' },
    { title: 'Artists', icon: '🎤', link: '/artists', description: 'Browse your favorite artists' },
    { title: 'Songs', icon: '🎵', link: '/songs', description: 'Explore all available songs' },
    { title: 'Albums', icon: '💿', link: '/albums', description: 'Discover new albums' },
  ];

  return (
    <Layout>
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-5 fw-bold">
              Welcome back, {user?.nombre || 'User'}! 👋
            </h1>
            <p className="text-muted">
              Account Type: <span className="badge bg-success">{user?.tipo_cuenta || 'Free'}</span>
            </p>
          </div>
        </div>

        <div className="row g-4 mb-5">
          {cards.map((card) => (
            <div className="col-6 col-md-3" key={card.title}>
              <Link to={card.link} className="text-decoration-none">
                <div className="card h-100 bg-secondary bg-opacity-25 border-secondary text-white text-center p-4 hover-shadow">
                  <div className="display-3 mb-3">{card.icon}</div>
                  <h5 className="card-title">{card.title}</h5>
                  <p className="card-text small text-muted">{card.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card bg-secondary bg-opacity-25 border-secondary text-white">
              <div className="card-header bg-transparent border-secondary">
                <h5 className="mb-0">Account Information</h5>
              </div>
              <div className="card-body">
                <table className="table table-dark table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: '40%' }}>Nombre</td>
                      <td className="fw-bold">{user?.nombre || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Email</td>
                      <td>{user?.email || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Fecha de Registro</td>
                      <td>{formatDate(user?.fecha_registro)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">País</td>
                      <td>{user?.pais || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Saldo</td>
                      <td className="text-success fw-bold">
                        ${parseFloat(user?.saldo || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
