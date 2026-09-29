/**
 * Small shared helpers used across pages and components.
 */

/** Seconds -> `m:ss` (or `h:mm:ss` for long tracks). */
export function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '--:--';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** ISO date -> `YYYY-MM-DD`, or '' when missing. */
export function toIsoDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/**
 * Stable hash so a given album/artist always gets the same placeholder
 * gradient. Without this, missing covers would all look identical and the
 * layout would read as broken rather than as "no artwork yet".
 */
export function hashString(input) {
  const str = String(input ?? '');
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export const COVER_VARIANTS = 10;

/** Pick a `--cover-N` token for a given key. */
export function coverIndex(key) {
  return hashString(key) % COVER_VARIANTS;
}

/** Inline style that points an element at its deterministic cover gradient. */
export function coverStyle(key) {
  return { '--cover': `var(--cover-${coverIndex(key)})` };
}

/**
 * Derive a muted hero tint from the same key so album/playlist headers feel
 * tied to their artwork.
 */
export function heroTint(key) {
  return `var(--cover-${coverIndex(key)})`;
}

/** Time-of-day greeting key used on the home page. */
export function greetingKey(date = new Date()) {
  const h = date.getHours();
  if (h < 6) return 'greeting.night';
  if (h < 12) return 'greeting.morning';
  if (h < 19) return 'greeting.afternoon';
  return 'greeting.evening';
}

/** Shuffle a copy of an array (Fisher-Yates). */
export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Localised message for an axios rejection.
 *
 * The API tags every error with a stable `code`; `translate` is called with
 * `api_error.<code>` so a localised string wins. The server's own Spanish
 * `error` field is only used for codes this build does not know about, and the
 * caller's translated fallback covers requests that never reached the server
 * (offline, DNS, timeout) where there is no response body at all.
 */
export function errorMessage(err, t, fallback) {
  const data = err?.response?.data;
  if (data?.code) {
    const key = `api_error.${data.code}`;
    const localised = t(key);
    if (localised !== key) return localised;
  }
  return data?.error || err?.message || fallback;
}
