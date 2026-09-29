import React, { useState, useEffect } from 'react';
import axios from '../api';
import { usePlayer } from '../context/PlayerContext';

function Search() {
    const { playSong, currentSong, isPlaying } = usePlayer();
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('songs');
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (query.trim().length >= 2) {
            const debounceTimer = setTimeout(() => {
                handleSearch();
            }, 300);
            return () => clearTimeout(debounceTimer);
        } else {
            setSongs([]);
            setAlbums([]);
            setArtists([]);
            setHasSearched(false);
        }
    }, [query]);

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const [songsRes, albumsRes, artistsRes] = await Promise.all([
                axios.get(`/search/songs?q=${encodeURIComponent(query)}`),
                axios.get(`/search/albums?q=${encodeURIComponent(query)}`),
                axios.get(`/search/artists?q=${encodeURIComponent(query)}`)
            ]);

            setSongs(songsRes.data);
            setAlbums(albumsRes.data);
            setArtists(artistsRes.data);
            setHasSearched(true);
        } catch (err) {
            setError('Error en la búsqueda');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePlaySong = (song) => {
        playSong(song);
    };

    const isCurrentSong = (songId) => currentSong && currentSong.id_cancion === songId;

    const totalResults = songs.length + albums.length + artists.length;

    return (
        <>
          <h2 className="mb-4"><i className="fas fa-search me-2"></i>Buscar</h2>

          {/* Search Input */}
          <div className="input-group mb-4">
              <span className="input-group-text bg-dark text-white border-secondary">
                  <i className="fas fa-search"></i>
              </span>
              <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Buscar canciones, álbumes o artistas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
              />
              <button
                  className="btn btn-success"
                  onClick={handleSearch}
                  disabled={loading}
              >
                  {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                      'Buscar'
                  )}
              </button>
          </div>

          {error && (
              <div className="alert alert-danger" role="alert">
                  {error}
              </div>
          )}

          {/* Tabs */}
          {hasSearched && (
              <>
                  <ul className="nav nav-tabs mb-3">
                      <li className="nav-item">
                          <button
                              className={`nav-link ${activeTab === 'songs' ? 'active bg-dark text-success border-success' : 'text-light'}`}
                              onClick={() => setActiveTab('songs')}
                          >
                              <i className="fas fa-music me-1"></i>Canciones
                              <span className="badge bg-secondary ms-1">{songs.length}</span>
                          </button>
                      </li>
                      <li className="nav-item">
                          <button
                              className={`nav-link ${activeTab === 'albums' ? 'active bg-dark text-success border-success' : 'text-light'}`}
                              onClick={() => setActiveTab('albums')}
                          >
                              <i className="fas fa-compact-disc me-1"></i>Álbumes
                              <span className="badge bg-secondary ms-1">{albums.length}</span>
                          </button>
                      </li>
                      <li className="nav-item">
                          <button
                              className={`nav-link ${activeTab === 'artists' ? 'active bg-dark text-success border-success' : 'text-light'}`}
                              onClick={() => setActiveTab('artists')}
                          >
                              <i className="fas fa-user me-1"></i>Artistas
                              <span className="badge bg-secondary ms-1">{artists.length}</span>
                          </button>
                      </li>
                  </ul>

                  {totalResults === 0 && !loading && (
                      <div className="text-center py-5">
                          <i className="fas fa-search fa-3x text-secondary mb-3"></i>
                          <p className="text-light">No se encontraron resultados para "{query}"</p>
                      </div>
                  )}

                  {/* Songs Tab */}
                  {activeTab === 'songs' && songs.length > 0 && (
                      <div className="list-group">
                          {songs.map(song => (
                              <div
                                  key={song.id_cancion}
                                  className={`list-group-item d-flex justify-content-content-between align-items-center bg-dark text-white border-secondary ${isCurrentSong(song.id_cancion) ? 'border-success border-2' : ''}`}
                              >
                                  <div className="d-flex align-items-center">
                                      {song.portada_album && (
                                          <img
                                              src={`/uploads/images/${song.portada_album}`}
                                              alt={song.titulo_album}
                                              className="rounded me-3"
                                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                          />
                                      )}
                                      <div>
                                          <div className="fw-bold">
                                              {song.titulo}
                                              {isCurrentSong(song.id_cancion) && (
                                                  <i className="fas fa-volume-up text-success ms-2"></i>
                                              )}
                                          </div>
                                          <small className="text-secondary">
                                              {song.nombre_artista} {song.titulo_album && `• ${song.titulo_album}`}
                                          </small>
                                      </div>
                                  </div>
                                  <button
                                      className={`btn btn-sm ${isCurrentSong(song.id_cancion) && isPlaying ? 'btn-success' : 'btn-outline-success'}`}
                                      onClick={() => handlePlaySong(song)}
                                  >
                                      <i className={`fas ${isCurrentSong(song.id_cancion) && isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* Albums Tab */}
                  {activeTab === 'albums' && albums.length > 0 && (
                      <div className="row">
                          {albums.map(album => (
                              <div key={album.id_album} className="col-md-4 col-lg-3 mb-4">
                                  <div className="card h-100 bg-secondary border-0">
                                      {album.portada && (
                                          <img
                                              src={`/uploads/${album.portada}`}
                                              className="card-img-top"
                                              alt={album.titulo}
                                              style={{ height: '180px', objectFit: 'cover' }}
                                          />
                                      )}
                                      <div className="card-body">
                                          <h5 className="card-title text-white">{album.titulo}</h5>
                                          <p className="card-text text-light small">{album.nombre_artista}</p>
                                          <span className="badge bg-dark">
                                              <i className="fas fa-music me-1"></i>
                                              {album.total_canciones} canciones
                                          </span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* Artists Tab */}
                  {activeTab === 'artists' && artists.length > 0 && (
                      <div className="row">
                          {artists.map(artist => (
                              <div key={artist.id_artista} className="col-md-4 col-lg-3 mb-4">
                                  <div className="card h-100 bg-secondary border-0 text-center">
                                      <div className="card-body">
                                          <div className="rounded-circle bg-dark d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '100px', height: '100px' }}>
                                              <i className="fas fa-user fa-3x text-secondary"></i>
                                          </div>
                                          <h5 className="card-title text-white">{artist.nombre_artista}</h5>
                                          <span className="badge bg-dark">
                                              <i className="fas fa-music me-1"></i>
                                              {artist.total_canciones} canciones
                                          </span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </>
          )}

          {/* Initial State */}
          {!hasSearched && !loading && (
              <div className="text-center py-5">
                  <i className="fas fa-search fa-3x text-secondary mb-3"></i>
                  <p className="text-light">Escribe al menos 2 caracteres para buscar</p>
                  <p className="text-secondary small">Busca canciones, álbumes o artistas</p>
              </div>
          )}
        </>
    );
}

export default Search;
