// Resolves URLs for files served out of the API's /uploads directory.
//
// Uploaded media (song audio, album covers, artist photos) lives on the API
// server, not in the frontend bundle. That matters because the two are
// deployed on different origins: the React app is static on GitHub Pages while
// the API runs on Render. A root-relative "/uploads/audio/x.wav" is resolved
// by the browser against the *page* origin, so on Pages it would request
// https://<user>.github.io/uploads/... and 404 — the file does exist, it is
// just being asked for from the wrong host.
//
// So when VITE_API_URL points at an absolute API base, media URLs are built
// from that origin. In local development VITE_API_URL is unset and the Vite
// dev server proxies /api to Express, so the root-relative form is correct
// there and we keep it.

const API_URL = import.meta.env.VITE_API_URL || '';

// "/api" suffix is routing, not part of the media origin.
const API_ORIGIN = API_URL.startsWith('http')
  ? API_URL.replace(/\/api\/?$/, '')
  : '';

/**
 * Builds an absolute URL for a file under the API's /uploads directory.
 *
 * @param {string} bucket  Subdirectory, e.g. 'audio', 'images', 'artists'.
 * @param {string} file    Filename as stored in the database.
 * @returns {string|null}  URL for the file, or null when no filename is given.
 */
export function mediaUrl(bucket, file) {
  if (!file) return null;
  const name = encodeURIComponent(String(file));
  const relative = `/uploads/${bucket}/${name}`;
  return API_ORIGIN ? `${API_ORIGIN}${relative}` : relative;
}

/** Builds a URL for a song's audio file. */
export function audioUrl(archivoAudio) {
  return mediaUrl('audio', archivoAudio);
}

/** Builds a URL for an album or playlist cover image. */
export function imageUrl(portada) {
  return mediaUrl('images', portada);
}

/** Builds a URL for an artist photo. */
export function artistUrl(fotoPerfil) {
  return mediaUrl('artists', fotoPerfil);
}
