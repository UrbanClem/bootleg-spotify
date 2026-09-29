/**
 * Server-render every route to smoke-test the UI.
 *
 * `vite build` only proves the modules parse; it never runs a component body.
 * Rendering through `renderToString` executes the real render path, so a bad
 * prop, a missing icon import or a hook-order mistake fails loudly here instead
 * of in the browser.
 *
 * Pages that fetch on mount only reach their spinner during SSR, so the
 * presentational components are additionally rendered against fixtures — that
 * is where nearly all of the JSX lives.
 *
 * Every render also runs twice — once per shipped language — and any
 * `[i18n] missing key` warning is treated as a failure, so a key that only
 * exists in `en.js` cannot slip through unnoticed.
 *
 * Run with:
 *   node node_modules/vite/bin/vite.js build --ssr ssr-smoke.jsx --outDir .smoke
 *   node .smoke/ssr-smoke.js
 */
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { I18nProvider, flattenKeys } from './src/i18n';
import en from './src/i18n/en';
import es from './src/i18n/es';

/**
 * Minimal `localStorage` shim. `I18nProvider` picks its language from this key,
 * so driving the run through it also exercises the persistence path rather than
 * reaching into the component for a test-only override.
 */
let storedLang = 'en';
globalThis.localStorage = {
  getItem: (k) => (k === 'bootleg.lang' ? storedLang : null),
  setItem: (k, v) => {
    if (k === 'bootleg.lang') storedLang = v;
  },
  removeItem: () => {}
};

import AppShell from './src/components/AppShell';
import Sidebar from './src/components/Sidebar';
import TopBar from './src/components/TopBar';
import PlayerBar from './src/components/PlayerBar';
import QueuePanel from './src/components/QueuePanel';
import Modal from './src/components/Modal';
import Shelf from './src/components/Shelf';
import MediaCard from './src/components/MediaCard';
import TrackRow from './src/components/TrackRow';
import Artwork from './src/components/Artwork';
import Slider from './src/components/Slider';
import Logo from './src/components/Logo';
import { Alert, Spinner, EmptyState, CardSkeleton } from './src/components/Feedback';
import { DetailHero, DetailActions, DetailStats, ArtistMeta } from './src/components/DetailPage';

import Home from './src/pages/Home';
import Search from './src/pages/Search';
import Library from './src/pages/Library';
import Album from './src/pages/Album';
import Artist from './src/pages/Artist';
import Playlist from './src/pages/Playlist';
import Profile from './src/pages/Profile';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import AdminLayout from './src/pages/admin/AdminLayout';
import AdminDashboard from './src/pages/admin/AdminDashboard';
import AdminSongs from './src/pages/admin/AdminSongs';
import AdminAlbums from './src/pages/admin/AdminAlbums';
import AdminArtists from './src/pages/admin/AdminArtists';
import AdminUsers from './src/pages/admin/AdminUsers';

const ROUTES = [
  ['/', '/', Home],
  ['/search', '/search', Search],
  ['/search?q=rock', '/search', Search],
  ['/library', '/library', Library],
  ['/albums/6', '/albums/:id', Album],
  ['/artists/6', '/artists/:id', Artist],
  ['/playlists/1000', '/playlists/:id', Playlist],
  ['/profile', '/profile', Profile],
  ['/login', '/login', Login],
  ['/register', '/register', Register]
];

const ADMIN_ROUTES = [
  ['/admin', AdminDashboard],
  ['/admin/songs', AdminSongs],
  ['/admin/albums', AdminAlbums],
  ['/admin/artists', AdminArtists],
  ['/admin/users', AdminUsers]
];

const SONG = {
  id_cancion: 1001,
  titulo: 'Midnight City',
  duracion: 244,
  popularidad: 88,
  fecha_lanzamiento: '2011-10-18',
  archivo_audio: null,
  explicit: 0,
  id_artista: 1001,
  id_album: 2001,
  nombre_artista: 'M83',
  titulo_album: 'Hurry Up, We’re Dreaming',
  portada_album: null
};

const ALBUM = {
  id_album: 2001,
  titulo: 'Hurry Up, We’re Dreaming',
  id_artista: 1001,
  fecha_lanzamiento: '2011-10-18',
  portada: null,
  genero: 'Synth-pop',
  nombre_artista: 'M83',
  total_canciones: 22
};

const ARTIST = {
  id_artista: 1001,
  nombre_artista: 'M83',
  verificado: 1,
  biografia: 'French synth-pop band.',
  fecha_registro: '2007-04-30',
  seguidores: 1_284_000,
  foto_perfil: null,
  total_canciones: 31
};

const PLAYLIST = {
  id_playlist: 1000,
  nombre_playlist: 'Focus',
  descripcion: 'For working',
  privada: 0,
  id_usuario: 1,
  fecha_creacion: '2026-01-04 10:00:00',
  total_canciones: 4
};

const COMPONENTS = [
  ['Artwork (placeholder)', <Artwork key="a" seed="Toxicity" alt="" />],
  ['Artwork (with cover)', <Artwork key="b" src="/uploads/images/x.jpg" alt="x" seed={7} round />],
  ['Logo', <Logo key="l" size={32} />],
  ['MediaCard album', <MediaCard key="m1" item={ALBUM} kind="album" onPlay />],
  ['MediaCard artist', <MediaCard key="m2" item={ARTIST} kind="artist" title={ARTIST.nombre_artista} subtitle="31 songs" seed={ARTIST.id_artista} />],
  ['MediaCard playlist', <MediaCard key="m3" item={PLAYLIST} kind="playlist" subtitle="4 songs" onPlay />],
  ['TrackRow', <TrackRow key="t1" song={SONG} index={0} queue={[SONG]} />],
  ['TrackRow (no queue)', <TrackRow key="t2" song={SONG} index={3} />],
  ['Shelf', <Shelf key="s1" title="Your playlists" to="/library" items={[PLAYLIST, { ...PLAYLIST, id_playlist: 1001 }]} kind="playlist" />],
  ['Shelf (loading)', <Shelf key="s2" title="Loading" items={[]} loading />],
  ['Shelf (hides when empty)', <Shelf key="s3" title="Empty" items={[]} />, { allowEmpty: true }],
  ['Slider', <Slider key="sl" value={0.4} max={1} onChange={() => {}} label="Volume" />],
  ['Alert error', <Alert key="a1" variant="error">Something failed</Alert>],
  ['Alert success', <Alert key="a2" variant="success" onDismiss={() => {}}>Saved</Alert>],
  ['Alert info', <Alert key="a3" variant="info">Note</Alert>],
  ['Spinner', <Spinner key="sp" />],
  ['Spinner center', <Spinner key="sp2" center />],
  ['EmptyState', <EmptyState key="es" title="Nothing here">No content.</EmptyState>],
  ['CardSkeleton', <CardSkeleton key="cs" count={4} />],
  ['Modal', <Modal key="m" title="Hello" onClose={() => {}}>Content</Modal>],
  ['DetailHero', <DetailHero key="dh" kindLabel="Album" title={ALBUM.titulo} tint="var(--cover-1)" art={null} meta={<><ArtistMeta id={ARTIST.id_artista} name={ARTIST.nombre_artista} /><span>2011</span></>} />],
  ['DetailActions', <DetailActions key="da" onPlay={() => {}} isPlaying={false} hasAudio />],
  ['DetailStats', <DetailStats key="ds"><span>22 songs</span></DetailStats>],
  ['Sidebar', <Sidebar key="sb" onCreatePlaylist={() => {}} />],
  ['TopBar', <TopBar key="tb" solid onOpenDrawer={() => {}} />],
  ['PlayerBar', <PlayerBar key="pb" queueOpen={false} onToggleQueue={() => {}} />],
  ['QueuePanel', <QueuePanel key="qp" onClose={() => {}} />]
];

function render(url, element) {
  return renderToString(
    <I18nProvider>
      <AuthProvider>
        <PlayerProvider>
          <MemoryRouter initialEntries={[url]}>{element}</MemoryRouter>
        </PlayerProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

function runSuite(record) {
  for (const [url, pattern, Page] of ROUTES) {
    record(url, () =>
      render(
        url,
        <Routes>
          <Route path={pattern} element={<Page />} />
        </Routes>
      )
    );
  }

  // Rendered directly: `AdminLayout` redirects signed-out visitors home, which
  // is correct behaviour but would leave these pages untested.
  for (const [url, Page] of ADMIN_ROUTES) {
    record(url, () => render(url, <Page />));
  }

  // `AdminLayout` redirects signed-out visitors home and `Shelf` hides itself
  // when it has nothing to show — both render nothing by design.
  record(
    'AdminLayout (redirects when signed out)',
    () => render('/admin', <AdminLayout />),
    { allowEmpty: true }
  );

  for (const entry of COMPONENTS) {
    const [name, element, opts] = entry;
    record(name, () => render('/', element), opts);
  }

  record('AppShell', () =>
    render(
      '/',
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<div>content</div>} />
        </Route>
      </Routes>
    )
  );
}

/** Keys defined in one dictionary but not the other. */
function dictionaryDrift() {
  const enKeys = new Set(flattenKeys(en));
  const esKeys = new Set(flattenKeys(es));
  return {
    onlyEn: [...enKeys].filter((k) => !esKeys.has(k)).sort(),
    onlyEs: [...esKeys].filter((k) => !enKeys.has(k)).sort(),
    count: enKeys.size
  };
}

export function smoke() {
  const results = [];
  const missingKeys = new Set();
  const realWarn = console.warn;

  // Swallow i18n warnings while rendering so they can fail the run explicitly
  // instead of scrolling past in the log.
  console.warn = (...args) => {
    const first = args[0];
    if (typeof first === 'string' && first.startsWith('[i18n] missing key:')) {
      missingKeys.add(first.replace('[i18n] missing key:', '').trim());
      return;
    }
    realWarn(...args);
  };

  try {
    for (const lang of ['en', 'es']) {
      storedLang = lang;
      const record = (name, fn, { allowEmpty = false } = {}) => {
        try {
          const html = fn();
          results.push({
            name: `[${lang}] ${name}`,
            ok: allowEmpty || html.length > 0,
            bytes: html.length,
            error: allowEmpty || html.length ? '' : 'rendered nothing'
          });
        } catch (err) {
          results.push({ name: `[${lang}] ${name}`, ok: false, bytes: 0, error: err.message });
        }
      };
      runSuite(record);
    }
  } finally {
    console.warn = realWarn;
  }

  return { results, missingKeys: [...missingKeys].sort(), drift: dictionaryDrift() };
}

const { results, missingKeys, drift } = smoke();
let failed = 0;
for (const r of results) {
  if (r.ok) {
    console.log(`  ok    ${r.name.padEnd(44)} ${r.bytes} bytes`);
  } else {
    failed++;
    console.log(`  FAIL  ${r.name.padEnd(44)} ${r.error}`);
  }
}

console.log(`\ndictionaries: ${drift.count} keys in en, en/es in sync`);
if (drift.onlyEn.length) {
  failed++;
  console.log(`  FAIL  missing from es: ${drift.onlyEn.join(', ')}`);
}
if (drift.onlyEs.length) {
  failed++;
  console.log(`  FAIL  missing from en: ${drift.onlyEs.join(', ')}`);
}
if (missingKeys.length) {
  failed++;
  console.log(`  FAIL  untranslated keys hit while rendering: ${missingKeys.join(', ')}`);
}

console.log(failed ? `\n${failed} failure(s)` : `\nall ${results.length} renders passed`);
if (failed) process.exitCode = 1;
