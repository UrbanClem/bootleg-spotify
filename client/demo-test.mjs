// Exercises the demo API the way the browser would, to catch logic errors
// before publishing. Run with: node demo-test.mjs
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k)
};
globalThis.sessionStorage = { getItem: () => null, setItem: () => {} };

const { default: api } = await import('./src/demo/api.js');

let pass = 0;
let fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
};

// --- auth ---
const bad = await api.post('/auth/login', { email: 'test@email.com', password: 'wrong' }).then(() => null, (e) => e);
check('wrong password rejected', bad?.response?.status === 400);

const login = await api.post('/auth/login', { email: 'test@email.com', password: '123456' });
check('admin login returns a token', typeof login.data.token === 'string');
check('admin login returns the user', login.data.user.email === 'test@email.com');
check('admin flag is set', login.data.user.tipo_cuenta === 'Admin');

const me = await api.get('/auth/me');
check('/auth/me returns the admin', me.data.id_usuario === 13);

// --- reads ---
const songs = await api.get('/songs');
check('141 songs', songs.data.length === 141);
check('songs are decorated with artist name', songs.data[0].nombre_artista !== undefined);

const albums = await api.get('/albums');
check('12 albums', albums.data.length === 12);
check('albums carry total_canciones', albums.data[0].total_canciones > 0);

const artists = await api.get('/artists');
check('8 artists', artists.data.length === 8);

const album = await api.get('/albums/1021');
check('Nevermind has 12 tracks', album.data.canciones.length === 12);
check('album tracks are decorated', album.data.canciones[0].nombre_artista === 'Nirvana');

const artist = await api.get('/artists/1017');
check('Nirvana has 12 songs', artist.data.canciones.length === 12);

const playlists = await api.get('/playlists');
check('admin sees their playlists', playlists.data.length > 0);

const playlist = await api.get('/playlists/3006');
check('Metal Essentials has 10 tracks', playlist.data.canciones.length === 10);

const users = await api.get('/users');
check('admin lists users', users.data.length === 2);

// --- search ---
const search = await api.get('/search/songs', { params: { q: 'teen' } });
check('search finds Smells Like Teen Spirit', search.data.some((s) => s.titulo === 'Smells Like Teen Spirit'));
const searchAlbums = await api.get('/search/albums', { params: { q: 'black' } });
check('search finds Black Sabbath', searchAlbums.data.length === 2);

// --- writes ---
const created = await api.post('/playlists', { nombre_playlist: 'My Demo List', descripcion: '', privada: false });
check('playlist created', typeof created.data.id === 'number');
const newId = created.data.id;

const added = await api.post(`/playlists/${newId}/songs`, { id_cancion: 1127 });
check('song added to playlist', added.data.message !== undefined);

const dupe = await api.post(`/playlists/${newId}/songs`, { id_cancion: 1127 }).then(() => null, (e) => e);
check('duplicate song rejected', dupe?.response?.status === 400);

const withSong = await api.get(`/playlists/${newId}`);
check('new playlist has 1 track', withSong.data.canciones.length === 1);

await api.delete(`/playlists/${newId}/songs/1127`);
const afterRemove = await api.get(`/playlists/${newId}`);
check('track removed', afterRemove.data.canciones.length === 0);

await api.delete(`/playlists/${newId}`);
const afterDelete = await api.get('/playlists');
check('playlist deleted', !afterDelete.data.some((p) => p.id_playlist === newId));

// --- non-admin cannot list users ---
store.set('token', 'demo.16.1');
const userMe = await api.get('/auth/me');
check('switched to the User account', userMe.data.id_usuario === 16);
const forbidden = await api.get('/users');
check('non-admin gets no user list', forbidden.data.length === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
