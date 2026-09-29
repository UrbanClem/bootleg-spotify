import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ArtistCard from '../components/ArtistCard';
import api from '../api';

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await api.get('/artists');
        setArtists(response.data);
        setError(null);
      } catch (err) {
        setError('Error loading artists. Please try again later.');
        console.error('Error fetching artists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return (
    <Layout>
      <div className="container">
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h1 className="display-5 fw-bold">Artists</h1>
            <p className="text-muted">Browse your favorite artists</p>
          </div>
          <div className="col-auto">
            <Link to="/search" className="btn btn-success">
              🔍 Search Artists
            </Link>
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading artists...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && artists.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No artists available.</p>
          </div>
        )}

        {!loading && !error && artists.length > 0 && (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
            {artists.map((artist) => (
              <ArtistCard key={artist.id_artista} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
