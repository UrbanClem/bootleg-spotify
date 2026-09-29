import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AlbumCard from '../components/AlbumCard';
import api from '../api';

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response = await api.get('/albums');
        setAlbums(response.data);
        setError(null);
      } catch (err) {
        setError('Error loading albums. Please try again later.');
        console.error('Error fetching albums:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div className="container">
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h1 className="display-5 fw-bold">Albums</h1>
          <p className="text-muted">Discover new albums</p>
        </div>
        <div className="col-auto">
          <Link to="/search" className="btn btn-success">
            🔍 Search Albums
          </Link>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading albums...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && albums.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No albums available.</p>
        </div>
      )}

      {!loading && !error && albums.length > 0 && (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
          {albums.map((album) => (
            <AlbumCard key={album.id_album} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
