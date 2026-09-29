import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SongCard from '../components/SongCard';
import api from '../api';

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/songs');
        setSongs(response.data);
        setError(null);
      } catch (err) {
        setError('Error loading songs. Please try again later.');
        console.error('Error fetching songs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return (
    <Layout>
      <div className="container">
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h1 className="display-5 fw-bold">Songs</h1>
            <p className="text-muted">Browse all available songs</p>
          </div>
          <div className="col-auto">
            <Link to="/search" className="btn btn-success">
              🔍 Search Songs
            </Link>
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading songs...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && songs.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No songs available.</p>
          </div>
        )}

        {!loading && !error && songs.length > 0 && (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
            {songs.map((song) => (
              <SongCard key={song.id_cancion} song={song} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
