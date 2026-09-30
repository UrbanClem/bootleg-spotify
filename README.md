# Bootleg Spotify

A full-stack Spotify clone: React + Vite on the front end, Node/Express on the
back end, MariaDB for storage. Everything runs in Docker, so there is nothing
to install locally beyond Docker itself.

The interface ships in **English and Spanish** with a runtime switcher, and
accounts come in exactly two flavours: **User** and **Admin**.

## About the catalogue and audio

Nothing in this repository is licensed music. The catalogue is invented —
5 artists, 5 albums, 40 songs, 8 per album — and every track's audio is a
**10-second synthesised tone**, not a recording. Each song gets a frequency
derived from a hash of its title, so the tracks are all distinct without
shipping any real audio.

The demo banner says so on screen. Album covers and artist photos are not
included; the UI falls back to generated placeholder artwork.

## Quick start

```bash
git clone <this-repo> bootleg-spotify
cd bootleg-spotify

cp .env.example .env        # optional: set a real JWT_SECRET
docker compose up --build
```

That is the whole setup. The first `up` builds the API image and initialises
MariaDB from `sql/spotify_db.sql`, which already contains the schema and two
working accounts.

| Service | URL |
|---------|-----|
| App     | http://localhost:3000 |
| API     | http://localhost:3001 |
| MariaDB | `localhost:3306`, user `root`, no password, database `spotify_db` |

The client runs outside Docker so it hot-reloads:

```bash
cd client
npm install
npm run dev          # http://localhost:3000
```

### Which SQL to load

`sql/` holds more than one dump, and they are not interchangeable:

| File | What it is |
|------|------------|
| `spotify_db.sql` | Schema + accounts. Auto-loaded by `docker compose`. |
| `spotify_db_aiven.sql` | The full current catalogue, prepared for Aiven MySQL (see below). |
| `replace_demo_content.sql` | Historical: swaps the demo rows for the real artists. Superseded. |
| `replace_demo_albums.sql` | Historical: real album rows. Superseded. |
| `seed_demo.sql` | Extra catalogue, ids 1000+. Not auto-loaded. |
| `migrate_account_types.sql` | Collapses the old paid tiers into User/Admin. |

> **Note:** `spotify_db.sql` still carries the older real-artist seed rows
> (Radiohead, System of a Down and friends), while `spotify_db_aiven.sql` holds
> the invented catalogue that the live deployment actually serves. A local
> `docker compose up` therefore shows the *older* catalogue. Point the database
> at `spotify_db_aiven.sql` if you want local and live to match.

`spotify_db_aiven.sql` differs in three ways, all required by Aiven: `DEFINER`
clauses are stripped (it rejects them), primary keys are inlined into
`CREATE TABLE` (it enforces `sql_require_primary_key` at create time), and the
phpMyAdmin stand-in tables are dropped.

## Demo accounts

| Email | Password | Account type |
|-------|----------|--------------|
| `test@email.com` | `123456` | Admin |
| `user@email.com` | `123456` | User |

Sign in as the admin to reach the admin panel (songs, albums, artists, users).
Every read endpoint requires authentication, so the app is behind the login
screen from the start.

## Project layout

```
bootleg-spotify/
├── client/                     # React front end (Vite)
│   ├── src/
│   │   ├── components/         # Shared UI, incl. LanguageSwitch, DemoBanner
│   │   ├── context/            # Auth and Player providers
│   │   ├── demo/               # In-browser mock API + seed (offline demo)
│   │   ├── i18n/               # en.js, es.js, I18nProvider/useI18n
│   │   ├── pages/
│   │   │   └── admin/          # Admin panel pages
│   │   ├── styles/             # tokens, base, layout, components, pages
│   │   ├── App.jsx             # Routes
│   │   ├── api.js              # Picks mock vs Axios; adds the bearer token
│   │   ├── media.js            # Builds /uploads URLs against the API origin
│   │   └── utils.js            # errorMessage, formatDuration, coverStyle…
│   ├── public/404.html         # SPA deep-link redirect for GitHub Pages
│   ├── .env.demo               # VITE_API_URL for the demo build
│   ├── vite.demo.config.js     # Pages build (base path, no /api proxy)
│   ├── demo-test.mjs           # Exercises the mock API end to end
│   └── ssr-smoke.jsx           # Renders every route in both languages
├── server/                     # Node/Express API
│   ├── config/                 # MariaDB pool
│   ├── middleware/             # requireAuth / requireAdmin
│   ├── routes/                 # auth, users, songs, albums, artists,
│   │                           #   playlists, search, upload
│   ├── scripts/gen-audio.js    # Regenerates the synthesised WAVs
│   ├── uploads/                # Committed: the catalogue's audio
│   │   ├── audio/              # served at /uploads/audio/<file>
│   │   ├── images/             # served at /uploads/images/<file>
│   │   └── artists/            # served at /uploads/artists/<file>
│   ├── .dockerignore           # Must NOT exclude uploads/
│   ├── server.js
│   └── Dockerfile
├── sql/                        # See "Which SQL to load" above
├── js/global-player.js         # Unused legacy script, not referenced
└── docker-compose.yml
```

## Media URLs

Audio, covers and artist photos are served by the API from `server/uploads`,
but the front end and the API are deployed to **different origins**. A
root-relative `/uploads/audio/x.wav` is resolved by the browser against the
*page* origin, so on GitHub Pages it would request
`https://<user>.github.io/uploads/...` and 404 even though the file is being
served correctly.

`client/src/media.js` handles this. When `VITE_API_URL` is an absolute URL, it
strips the trailing `/api` and builds upload URLs from that origin; otherwise it
falls back to the relative form, which is what local dev needs since Vite
proxies `/api` to Express. Components call `audioUrl()`, `imageUrl()` and
`artistUrl()` rather than string-concatenating paths, and those helpers also
`encodeURIComponent` the filename, which matters because several titles contain
spaces.

## Deployment

Three services, three providers:

| Piece | Host | Notes |
|-------|------|-------|
| Frontend | GitHub Pages, `gh-pages` branch | Static, `base: /bootleg-spotify/` |
| API | Render | Builds `server/Dockerfile`, root dir `server` |
| Database | Aiven MySQL | SSL required, see `server/config/database.js` |

Build the front end and publish it:

```bash
cd client
npm run build:demo
# then push client/dist to gh-pages, keeping public/404.html
```

`client/public/404.html` is what makes deep links work: Pages serves it for any
path it does not recognise, and it redirects back to the entry point with the
original path in `?p=` for `main.jsx` to restore. Set **Settings → Pages →
Source** to the `gh-pages` branch, root.

### Deploying audio

The WAVs live in `server/uploads/audio/` and are **committed to git** so they
exist inside the Docker build context. That makes `.dockerignore` load-bearing:

```dockerignore
# WRONG — the image ships with no audio at all
uploads
```

With `uploads` excluded, the directories are still recreated at boot by the
`mkdirSync` in `server.js`, so the app looks healthy while every track 404s.
`GET /api/version` reports the running commit and the WAV count, which is the
fastest way to tell this apart from a stale deploy:

```json
{ "commit": "cf1a03d…", "audio_file_count": 40, "sample_audio_files": ["After Hours.wav", …] }
```

**Uploaded files are ephemeral.** Anything an admin uploads through the panel is
written to the container's filesystem and is lost on the next deploy or restart.
Only the committed catalogue audio is durable. Persisting uploads would mean
moving them to object storage or a mounted volume.

## Languages

English is the source language. `client/src/i18n/en.js` defines every key;
`client/src/i18n/es.js` mirrors it exactly. The `EN | ES` control sits in the
top bar and, because the app is entirely behind login, also on the sign-in and
sign-up screens so the language can be chosen before authenticating.

The choice is stored in `localStorage` under `bootleg.lang`. On a first visit
it is inferred from `navigator.language`, and it also drives
`<html lang>` and the document title.

To add or change a string:

1. Add it to `client/src/i18n/en.js`.
2. Add the same key to `client/src/i18n/es.js`.
3. Use it with `t('section.key')` from `useI18n()`.

Values interpolate `{placeholders}` and support plurals as
`{ one: '…', other: '…' }` resolved by passing `{ n }`. A key that is missing
falls back to English, then to the key itself with a `console.warn`, so an
omission is visible rather than silent.

`npm run smoke` in `client/` renders every route and component in **both**
languages and fails if a key is missing from either dictionary, so the two
files cannot drift apart.

### Server error messages

API errors still return the original Spanish `error` string for server-side
logs, but they also carry a stable `code`. The client renders
`api_error.<code>` from the dictionary, so an English UI never flashes Spanish
text. `errorMessage(err, t, fallback)` prefers the localised string, then the
server text, then the caller's own fallback.

## Account types

`usuario.tipo_cuenta` is `enum('User','Admin')`. There is no paid tier, no
subscription and no wallet balance — the `pagos` / `suscripciones` tables and
`usuario.saldo` were dropped entirely, since no route referenced them.

`sql/migrate_account_types.sql` performs that collapse on an existing
database: it widens the enum, rewrites `Free`/`Premium` rows to `User`, narrows
the enum back down, drops the billing tables, and renames the seeded
`premium@email.com` demo account. It is safe to run more than once. **A fresh
clone does not need it** — `sql/spotify_db.sql` is already migrated.

Note that MariaDB coerces out-of-range `enum` values to `''` rather than
rejecting the `UPDATE`, which is why the migration widens the enum first.

The account type is shown read-only in the admin panel. There is no API route to
change another user's role, so no edit control is offered.

## Audio

Playback uses `cancion.archivo_audio`. A song with an empty value shows up
everywhere in the UI but is flagged as having no audio and will not play. In the
current catalogue all 40 songs have a value.

To regenerate the synthesised audio after changing the catalogue:

```bash
cd server
DB_HOST=… DB_PORT=… DB_USER=… DB_PASSWORD=… DB_NAME=… node scripts/gen-audio.js
```

Each song's frequency is `220 + (hash(titulo) % 660)` Hz — the fundamental plus
two harmonics at 0.6/0.3/0.1 amplitude, with a 100 ms fade at each end to avoid
clicks. 10 seconds, 16-bit, 44.1 kHz mono, which is 882044 bytes per file.

Admins can upload audio from the admin panel (`POST /api/upload/audio`,
MP3/WAV/OGG/M4A, 50 MB), subject to the ephemeral-filesystem caveat above.

## Demo mode

Setting `VITE_DEMO=true` swaps the Axios instance for a localStorage-backed mock
in `client/src/demo/`, so the whole app can be browsed with no backend at all.
This is what makes the frontend runnable as pure static files.

```bash
cd client
VITE_DEMO=true npm run dev
```

```bash
node client/demo-test.mjs      # exercises the mock end to end
```

Note that the mock's seed data is the older real-artist catalogue, so demo mode
and the live deployment show different content.

## Tests

```bash
cd client
npm run build       # type-free production build
npm run build:demo  # GitHub Pages build
npm run smoke       # server-render every route in EN and ES

node demo-test.mjs  # in-browser mock API
```

`npm run smoke` exists because `vite build` only proves the modules parse — it
never runs a component body. Rendering through `renderToString` executes the
real render path, so a bad prop, a missing import or a hook-order mistake fails
there instead of in the browser.

## API

All routes are prefixed with `/api`. Every endpoint except `POST /auth/login`
and `POST /auth/register` requires `Authorization: Bearer <token>`.
Write routes marked *(admin)* also require the `Admin` account type.

### Diagnostics

- `GET /health` — liveness check
- `GET /version` — running commit and how many audio files are present

### Auth
- `POST /auth/register` — create an account (always created as `User`)
- `POST /auth/login` — exchange credentials for a JWT
- `GET /auth/me` — the current user

### Users
- `GET /users` *(admin)*
- `GET /users/:id`
- `PUT /users/:id` — `nombre`, `email`, `fecha_nacimiento`, `pais`; every accepted column is written, so always submit the full set
- `DELETE /users/:id` *(admin)*

### Songs
- `GET /songs` · `GET /songs/:id`
- `POST /songs` *(admin)* · `PUT /songs/:id` *(admin)* · `DELETE /songs/:id` *(admin)*

### Albums
- `GET /albums` · `GET /albums/:id`
- `POST /albums` *(admin)* · `PUT /albums/:id` *(admin)* · `DELETE /albums/:id` *(admin)*

### Artists
- `GET /artists` · `GET /artists/:id`
- `POST /artists` *(admin)* · `PUT /artists/:id` *(admin)* · `DELETE /artists/:id` *(admin)*

### Playlists
- `GET /playlists` — the current user's own playlists
- `GET /playlists/:id` — a playlist plus its songs
- `POST /playlists` · `PUT /playlists/:id` · `DELETE /playlists/:id`
- `POST /playlists/:id/songs` — body `{ id_cancion }`
- `DELETE /playlists/:id/songs/:songId`

### Search
- `GET /search/songs?q=` · `GET /search/albums?q=` · `GET /search/artists?q=`

### Uploads
- `POST /upload/audio` *(admin)* — multipart, field `audio`, 50 MB
- `POST /upload/image` *(admin)* — multipart, field `image`, `type=album|artist`, 10 MB

## Notes

- `.env` holds `JWT_SECRET` and is gitignored. `docker compose` falls back to
  `dev_secret_change_in_prod`, which is fine locally and not fine anywhere else.
- `docker-compose.yml` mounts `./server/uploads` into the API container, not
  `./uploads`. The catalogue's audio sits under `server/` so it is inside the
  build context; mounting a root-level `./uploads` would create an empty
  directory and hide the baked-in files.
- `sql/seed_demo.sql` is committed but not auto-loaded. To apply the extra
  catalogue by hand, note that PowerShell has no `<` operator, so pipe the file
  through `cmd`:

  ```powershell
  cmd /c "docker exec -i bootleg-spotify-db mysql -uroot --default-character-set=utf8mb4 spotify_db < sql/seed_demo.sql"
  ```

  The `utf8mb4` client charset is not optional — without it the connection
  negotiates latin1 and every accented character is flattened to `?`.
- To load a dump into Aiven, pipe it through the MySQL client. `DEFINER`
  clauses and missing primary keys are both rejected, which is why
  `spotify_db_aiven.sql` exists as a separate file.
- If you run the Vite dev server yourself, pass `--port 3000 --strictPort`. A
  duplicate instance silently binds 3001, which is the API's port.
- `js/global-player.js` is dead code left over from a vanilla-JS version of the
  player. Nothing references it.
- On PowerShell, use `npm.cmd` — plain `npm` is blocked by the execution policy.
- No XAMPP or local PHP is involved; the only requirement is Docker.
