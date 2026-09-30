import { seed } from './seed.js';

/**
 * Demo-mode API.
 *
 * GitHub Pages can only serve static files, so there is no Express API or
 * MariaDB to talk to. This module is a drop-in replacement for the axios
 * instance in `api.js`: it keeps the same `get/post/put/delete` shape and the
 * same response envelope (`{ data }`), but serves everything from a
 * localStorage-backed store seeded from the real catalogue.
 *
 * Writes are accepted and applied to the store, so creating a playlist, adding
 * a track or editing a profile all behave the way they do against the real API.
 * The changes live in the visitor's browser only.
 */

const STORE_KEY = 'bootleg.demo.db';
const TOKEN_KEY = 'token';

// Demo credentials. The real API hashes passwords with bcrypt; here we only
// need to recognise the two seeded accounts.
const DEMO_PASSWORD = '123456';

/** A tiny artificial latency so loading states are visible, as they would be
 *  against a real server. */
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt or absent store: reseed.
  }
  const fresh = JSON.parse(JSON.stringify(seed));
  localStorage.setItem(STORE_KEY, JSON.stringify(fresh));
  return fresh;
}

function save(db) {
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
}

let db = load();

// ---- joins ----------------------------------------------------------------
// The real API returns denormalised rows (song + artist name + album title).
// Reproduce those shapes here so the client code is identical in both modes.

const artistById = (id) => db.artists.find((a) => a.id_artista === id) || null;
const albumById = (id) => db.albums.find((a) => a.id_album === id) || null;

function decorateSong(song) {
  const artist = artistById(song.id_artista);
  const album = song.id_album ? albumById(song.id_album) : null;
  return {
    ...song,
    nombre_artista: artist ? artist.nombre_artista : null,
    titulo_album: album ? album.titulo : null,
    portada_album: album ? album.portada : null
  };
}

function decorateAlbum(album) {
  const artist = artistById(album.id_artista);
  const total = db.songs.filter((s) => s.id_album === album.id_album).length;
  return { ...album, nombre_artista: artist ? artist.nombre_artista : null, total_canciones: total };
}

function decorateArtist(artist) {
  const total = db.songs.filter((s) => s.id_artista === artist.id_artista).length;
  return { ...artist, total_canciones: total };
}

function songsForAlbum(albumId) {
  return db.songs.filter((s) => s.id_album === albumId).map(decorateSong);
}

function songsForArtist(artistId) {
  return db.songs
    .filter((s) => s.id_artista === artistId)
    .map((s) => ({ ...decorateSong(s), nombre_artista: artistById(artistId)?.nombre_artista }));
}

function songsForPlaylist(playlistId) {
  return db.playlistCancion
    .filter((pc) => pc.id_playlist === playlistId)
    .sort((a, b) => a.orden - b.orden)
    .map((pc) => {
      const song = db.songs.find((s) => s.id_cancion === pc.id_cancion);
      if (!song) return null;
      const artist = artistById(song.id_artista);
      const album = song.id_album ? albumById(song.id_album) : null;
      return { ...song, nombre_artista: artist?.nombre_artista, titulo_album: album?.titulo, portada_album: album?.portada, orden: pc.orden, fecha_agregado: pc.fecha_agregado };
    })
    .filter(Boolean);
}

// ---- helpers --------------------------------------------------------------

function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

function makeToken(user) {
  // Not a real JWT - just enough for the app to persist a session.
  return `demo.${user.id_usuario}.${Date.now()}`;
}

function userForToken(token) {
  if (!token || !token.startsWith('demo.')) return null;
  const id = Number(token.split('.')[1]);
  const user = db.users.find((u) => u.id_usuario === id);
  return user ? publicUser(user) : null;
}

// The axios interceptor in api.js reads the token from localStorage under
// 'token'. Read it live on every request so a login that happens after this
// module loads is picked up without any extra wiring.
function currentToken() {
  return localStorage.getItem('token');
}

// ---- the API surface ------------------------------------------------------

async function get(path, config = {}) {
  await delay();
  const params = config.params || {};

  if (path === '/auth/me') {
    const user = userForToken(currentToken());
    if (!user) return { data: null };
    return { data: user };
  }

  if (path === '/songs') {
    return { data: [...db.songs].sort((a, b) => b.popularidad - a.popularidad).map(decorateSong) };
  }
  let m = path.match(/^\/songs\/(\d+)$/);
  if (m) {
    const song = db.songs.find((s) => s.id_cancion === Number(m[1]));
    return { data: song ? decorateSong(song) : null };
  }

  if (path === '/albums') {
    return { data: [...db.albums].sort((a, b) => (b.fecha_lanzamiento || '').localeCompare(a.fecha_lanzamiento || '')).map(decorateAlbum) };
  }
  m = path.match(/^\/albums\/(\d+)$/);
  if (m) {
    const album = albumById(Number(m[1]));
    if (!album) return { data: null };
    return { data: { ...decorateAlbum(album), canciones: songsForAlbum(album.id_album) } };
  }

  if (path === '/artists') {
    return { data: [...db.artists].sort((a, b) => b.seguidores - a.seguidores || a.nombre_artista.localeCompare(b.nombre_artista)).map(decorateArtist) };
  }
  m = path.match(/^\/artists\/(\d+)$/);
  if (m) {
    const artist = artistById(Number(m[1]));
    if (!artist) return { data: null };
    return { data: { ...decorateArtist(artist), canciones: songsForArtist(artist.id_artista) } };
  }

  if (path === '/playlists') {
    const user = userForToken(currentToken());
    if (!user) return { data: [] };
    return { data: db.playlists.filter((p) => p.id_usuario === user.id_usuario).map((p) => ({ ...p, total_canciones: db.playlistCancion.filter((pc) => pc.id_playlist === p.id_playlist).length })) };
  }
  m = path.match(/^\/playlists\/(\d+)$/);
  if (m) {
    const playlist = db.playlists.find((p) => p.id_playlist === Number(m[1]));
    if (!playlist) return { data: null };
    return { data: { ...playlist, canciones: songsForPlaylist(playlist.id_playlist) } };
  }

  if (path === '/users') {
    const user = userForToken(currentToken());
    if (!user || user.tipo_cuenta !== 'Admin') return { data: [] };
    return { data: db.users.map(publicUser) };
  }
  m = path.match(/^\/users\/(\d+)$/);
  if (m) {
    const user = db.users.find((u) => u.id_usuario === Number(m[1]));
    return { data: user ? publicUser(user) : null };
  }

  if (path === '/search/songs') {
    const q = (params.q || '').toLowerCase();
    return { data: db.songs.filter((s) => s.titulo.toLowerCase().includes(q) || (artistById(s.id_artista)?.nombre_artista || '').toLowerCase().includes(q)).map(decorateSong) };
  }
  if (path === '/search/albums') {
    const q = (params.q || '').toLowerCase();
    return { data: db.albums.filter((a) => a.titulo.toLowerCase().includes(q) || (artistById(a.id_artista)?.nombre_artista || '').toLowerCase().includes(q) || (a.genero || '').toLowerCase().includes(q)).map(decorateAlbum) };
  }
  if (path === '/search/artists') {
    const q = (params.q || '').toLowerCase();
    return { data: db.artists.filter((a) => a.nombre_artista.toLowerCase().includes(q) || (a.biografia || '').toLowerCase().includes(q)).map(decorateArtist) };
  }

  throw new Error(`Demo API: unhandled GET ${path}`);
}

async function post(path, body = {}) {
  await delay();

  if (path === '/auth/login') {
    const user = db.users.find((u) => u.email === body.email && u.password === body.password);
    if (!user) {
      const err = new Error('bad credentials');
      err.response = { status: 400, data: { error: 'Contraseña incorrecta', code: 'auth_bad_password' } };
      throw err;
    }
    const token = makeToken(user);
    localStorage.setItem(TOKEN_KEY, token);
    return { data: { token, user: publicUser(user) } };
  }

  if (path === '/auth/register') {
    if (db.users.some((u) => u.email === body.email)) {
      const err = new Error('taken');
      err.response = { status: 400, data: { error: 'Este email ya está registrado', code: 'auth_email_taken' } };
      throw err;
    }
    const user = {
      id_usuario: nextId(db.users.map((u) => ({ id: u.id_usuario }))),
      nombre: body.nombre,
      email: body.email,
      password: DEMO_PASSWORD,
      tipo_cuenta: 'User',
      fecha_registro: new Date().toISOString().slice(0, 10),
      fecha_nacimiento: null,
      pais: null,
      ultima_conexion: null
    };
    db.users.push(user);
    save(db);
    return { data: { message: 'Registro exitoso', userId: user.id_usuario } };
  }

  if (path === '/playlists') {
    const user = userForToken(currentToken());
    const playlist = {
      id_playlist: nextId(db.playlists.map((p) => ({ id: p.id_playlist }))),
      nombre_playlist: body.nombre_playlist,
      id_usuario: user.id_usuario,
      descripcion: body.descripcion || '',
      fecha_creacion: new Date().toISOString(),
      privada: body.privada ? 1 : 0,
      portada: null
    };
    db.playlists.push(playlist);
    save(db);
    return { data: { message: 'Playlist creada exitosamente', id: playlist.id_playlist } };
  }

  m = path.match(/^\/playlists\/(\d+)\/songs$/);
  if (m) {
    const playlistId = Number(m[1]);
    if (db.playlistCancion.some((pc) => pc.id_playlist === playlistId && pc.id_cancion === body.id_cancion)) {
      const err = new Error('duplicate');
      err.response = { status: 400, data: { error: 'La canción ya está en la playlist', code: 'playlist_song_duplicate' } };
      throw err;
    }
    const orden = db.playlistCancion.filter((pc) => pc.id_playlist === playlistId).reduce((max, pc) => Math.max(max, pc.orden), 0) + 1;
    db.playlistCancion.push({ id_playlist: playlistId, id_cancion: body.id_cancion, orden, fecha_agregado: new Date().toISOString() });
    save(db);
    return { data: { message: 'Canción agregada a la playlist' } };
  }

  if (path === '/songs') {
    const song = {
      id_cancion: nextId(db.songs.map((s) => ({ id: s.id_cancion }))),
      titulo: body.titulo,
      duracion: body.duracion,
      id_artista: body.id_artista,
      id_album: body.id_album || null,
      popularidad: 0,
      fecha_lanzamiento: body.fecha_lanzamiento || null,
      archivo_audio: body.archivo_audio || '',
      letra: body.letra || '',
      explicit: body.explicit ? 1 : 0
    };
    db.songs.push(song);
    save(db);
    return { data: { message: 'Canción creada exitosamente', id: song.id_cancion } };
  }

  if (path === '/albums') {
    const album = {
      id_album: nextId(db.albums.map((a) => ({ id: a.id_album }))),
      titulo: body.titulo,
      id_artista: body.id_artista,
      fecha_lanzamiento: body.fecha_lanzamiento || null,
      portada: body.portada || null,
      genero: body.genero || null
    };
    db.albums.push(album);
    save(db);
    return { data: { message: 'Álbum creado exitosamente', id: album.id_album } };
  }

  if (path === '/artists') {
    const artist = {
      id_artista: nextId(db.artists.map((a) => ({ id: a.id_artista }))),
      nombre_artista: body.nombre_artista,
      verificado: body.verificado ? 1 : 0,
      biografia: body.biografia || null,
      fecha_registro: new Date().toISOString().slice(0, 10),
      reproducciones_totales: 0,
      seguidores: 0,
      foto_perfil: body.foto_perfil || null
    };
    db.artists.push(artist);
    save(db);
    return { data: { message: 'Artista creado exitosamente', id: artist.id_artista } };
  }

  // Uploads: accept the request and pretend to store the file.
  if (path.startsWith('/upload/')) {
    return { data: { message: 'Archivo subido', file: `demo-${Date.now()}.bin` } };
  }

  throw new Error(`Demo API: unhandled POST ${path}`);
}

let m;

async function put(path, body = {}) {
  await delay();

  m = path.match(/^\/playlists\/(\d+)$/);
  if (m) {
    const playlist = db.playlists.find((p) => p.id_playlist === Number(m[1]));
    if (playlist) {
      playlist.nombre_playlist = body.nombre_playlist ?? playlist.nombre_playlist;
      playlist.descripcion = body.descripcion ?? playlist.descripcion;
      playlist.privada = body.privada !== undefined ? (body.privada ? 1 : 0) : playlist.privada;
      save(db);
    }
    return { data: { message: 'Playlist actualizada exitosamente' } };
  }

  m = path.match(/^\/songs\/(\d+)$/);
  if (m) {
    const song = db.songs.find((s) => s.id_cancion === Number(m[1]));
    if (song) {
      Object.assign(song, {
        titulo: body.titulo ?? song.titulo,
        duracion: body.duracion ?? song.duracion,
        id_artista: body.id_artista ?? song.id_artista,
        id_album: body.id_album !== undefined ? body.id_album : song.id_album,
        fecha_lanzamiento: body.fecha_lanzamiento ?? song.fecha_lanzamiento,
        archivo_audio: body.archivo_audio ?? song.archivo_audio,
        letra: body.letra ?? song.letra,
        explicit: body.explicit !== undefined ? (body.explicit ? 1 : 0) : song.explicit
      });
      save(db);
    }
    return { data: { message: 'Canción actualizada exitosamente' } };
  }

  m = path.match(/^\/albums\/(\d+)$/);
  if (m) {
    const album = db.albums.find((a) => a.id_album === Number(m[1]));
    if (album) {
      Object.assign(album, {
        titulo: body.titulo ?? album.titulo,
        id_artista: body.id_artista ?? album.id_artista,
        fecha_lanzamiento: body.fecha_lanzamiento ?? album.fecha_lanzamiento,
        portada: body.portada !== undefined ? body.portada : album.portada,
        genero: body.genero ?? album.genero
      });
      save(db);
    }
    return { data: { message: 'Álbum actualizado exitosamente' } };
  }

  m = path.match(/^\/artists\/(\d+)$/);
  if (m) {
    const artist = db.artists.find((a) => a.id_artista === Number(m[1]));
    if (artist) {
      Object.assign(artist, {
        nombre_artista: body.nombre_artista ?? artist.nombre_artista,
        verificado: body.verificado !== undefined ? (body.verificado ? 1 : 0) : artist.verificado,
        biografia: body.biografia ?? artist.biografia,
        foto_perfil: body.foto_perfil !== undefined ? body.foto_perfil : artist.foto_perfil
      });
      save(db);
    }
    return { data: { message: 'Artista actualizado exitosamente' } };
  }

  m = path.match(/^\/users\/(\d+)$/);
  if (m) {
    const user = db.users.find((u) => u.id_usuario === Number(m[1]));
    if (user) {
      Object.assign(user, {
        nombre: body.nombre ?? user.nombre,
        email: body.email ?? user.email,
        fecha_nacimiento: body.fecha_nacimiento !== undefined ? body.fecha_nacimiento : user.fecha_nacimiento,
        pais: body.pais !== undefined ? body.pais : user.pais
      });
      save(db);
    }
    return { data: { message: 'Perfil actualizado exitosamente' } };
  }

  throw new Error(`Demo API: unhandled PUT ${path}`);
}

async function del(path) {
  await delay();

  m = path.match(/^\/playlists\/(\d+)\/songs\/(\d+)$/);
  if (m) {
    db.playlistCancion = db.playlistCancion.filter((pc) => !(pc.id_playlist === Number(m[1]) && pc.id_cancion === Number(m[2])));
    save(db);
    return { data: { message: 'Canción removida de la playlist' } };
  }

  m = path.match(/^\/playlists\/(\d+)$/);
  if (m) {
    db.playlists = db.playlists.filter((p) => p.id_playlist !== Number(m[1]));
    db.playlistCancion = db.playlistCancion.filter((pc) => pc.id_playlist !== Number(m[1]));
    save(db);
    return { data: { message: 'Playlist eliminada exitosamente' } };
  }

  m = path.match(/^\/songs\/(\d+)$/);
  if (m) {
    db.songs = db.songs.filter((s) => s.id_cancion !== Number(m[1]));
    db.playlistCancion = db.playlistCancion.filter((pc) => pc.id_cancion !== Number(m[1]));
    save(db);
    return { data: { message: 'Canción eliminada exitosamente' } };
  }

  m = path.match(/^\/albums\/(\d+)$/);
  if (m) {
    db.albums = db.albums.filter((a) => a.id_album !== Number(m[1]));
    save(db);
    return { data: { message: 'Álbum eliminado exitosamente' } };
  }

  m = path.match(/^\/artists\/(\d+)$/);
  if (m) {
    db.artists = db.artists.filter((a) => a.id_artista !== Number(m[1]));
    save(db);
    return { data: { message: 'Artista eliminado exitosamente' } };
  }

  m = path.match(/^\/users\/(\d+)$/);
  if (m) {
    db.users = db.users.filter((u) => u.id_usuario !== Number(m[1]));
    save(db);
    return { data: { message: 'Usuario eliminado exitosamente' } };
  }

  throw new Error(`Demo API: unhandled DELETE ${path}`);
}

export function resetDemo() {
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  db = load();
}

const api = { get, post, put, delete: del };

export default api;
