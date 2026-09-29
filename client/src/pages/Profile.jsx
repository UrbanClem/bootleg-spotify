import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    fecha_nacimiento: '',
    pais: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        fecha_nacimiento: user.fecha_nacimiento
          ? new Date(user.fecha_nacimiento).toISOString().split('T')[0]
          : '',
        pais: user.pais || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put(`/users/${user.id_usuario}`, formData);
      setMessage({ type: 'success', text: response.data.message || 'Profile updated successfully!' });
      // Update user in context
      updateUser({ ...user, ...formData });
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.error || 'Error updating profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const countries = ['México', 'España', 'Argentina', 'Colombia'];

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 fw-bold">Your Profile</h1>
          <p className="text-muted">Manage your account information</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage({ type: '', text: '' })}
          ></button>
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="card bg-secondary bg-opacity-25 border-secondary text-white mb-4">
            <div className="card-header bg-transparent border-secondary">
              <h5 className="mb-0">Edit Profile</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control bg-dark text-white border-secondary"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="fecha_nacimiento" className="form-label">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className="form-control bg-dark text-white border-secondary"
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="pais" className="form-label">País</label>
                  <select
                    className="form-select bg-dark text-white border-secondary"
                    id="pais"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-secondary bg-opacity-25 border-secondary text-white">
            <div className="card-header bg-transparent border-secondary">
              <h5 className="mb-0">Account Info</h5>
            </div>
            <div className="card-body">
              <table className="table table-dark table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Tipo de Cuenta</td>
                    <td className="text-end">
                      <span className="badge bg-success">{user?.tipo_cuenta || 'Free'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Fecha de Registro</td>
                    <td className="text-end">{formatDate(user?.fecha_registro)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Saldo</td>
                    <td className="text-end text-success fw-bold">
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
  );
}
