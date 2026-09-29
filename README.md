# Bootleg Spotify

A full-stack Spotify clone: React + Vite on the front end, Node/Express on the
back end, MariaDB for storage. Everything runs in Docker, so there is nothing
to install locally beyond Docker itself.

The interface ships in **English and Spanish** with a runtime switcher, and
accounts come in exactly two flavours: **User** and **Admin**.

## Quick start

```bash
git clone <this-repo> bootleg-spotify
cd bootleg-spotify

cp .env.example .env        # optional: set a real JWT_SECRET
docker compose up --build
```

That is the whole setup. The first `up` builds the API image and initialises
MariaDB from `sql/spotify_db.sql`, which already contains the schema, a demo
catalogue and two working accounts.

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
│   │   ├── components/         # Shared UI, incl. LanguageSwitch
│   │   ├── context/            # Auth and Player providers
│   │   ├── i18n/               # en.js, es.js, I18nProvider/useI18n
│   │   ├── pages/
│   │   │   └── admin/          # Admin panel pages
│   │   ├── styles/             # tokens, base, layout, components, pages
│   │   ├── App.jsx             # Routes
│   │   ├── api.js              # Axios instance (adds the bearer token)
│   │   └── utils.js            # errorMessage, formatDuration, coverStyle…
│   ├── ssr-smoke.jsx           # Renders every route in both languages
│   └── index.html
├── server/                     # Node/Express API
│   ├── config/                 # MariaDB pool
│   ├── middleware/             # requireAuth / requireAdmin
│   ├── routes/                 # auth, users, songs, albums, artists,
│   │                           #   playlists, search, upload
│   ├── server.js
│   └── Dockerfile
├── uploads/                    # Uploaded audio and images
│   ├── audio/                  # served at /uploads/audio/<file>
│   ├── images/                 # served at /uploads/images/<file>
│   └── artists/                # served at /uploads/artists/<file>
├── sql/
│   ├── spotify_db.sql          # Full schema + demo data (auto-loaded)
│   ├── seed_demo.sql           # Optional extra catalogue, ids 1000+
│   └── migrate_account_types.sql
└── docker-compose.yml
```

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
everywhere in the UI but is flagged as having no audio and will not play. The
demo data ships with one playable track; the rest degrade gracefully rather
than breaking. Admins can upload audio from the admin panel
(`POST /api/upload/audio`, MP3/WAV/OGG/M4A, 50 MB).

## Tests

```bash
cd client
npm run build     # type-free production build
npm run smoke     # server-render every route in EN and ES
```

`npm run smoke` exists because `vite build` only proves the modules parse — it
never runs a component body. Rendering through `renderToString` executes the
real render path, so a bad prop, a missing import or a hook-order mistake fails
there instead of in the browser.

## API

All routes are prefixed with `/api`. Every endpoint except `POST /auth/login`
and `POST /auth/register` requires `Authorization: Bearer <token>`.
Write routes marked *(admin)* also require the `Admin` account type.

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
- `POST /upload/audio` *(admin)* — multipart, field `audio`
- `POST /upload/image` *(admin)* — multipart, field `image`, `type=album|artist`

## Notes

- `.env` holds `JWT_SECRET` and is gitignored. `docker compose` falls back to
  `dev_secret_change_in_prod`, which is fine locally and not fine anywhere else.
- `sql/seed_demo.sql` is committed but not auto-loaded. To apply the extra
  catalogue by hand, note that PowerShell has no `<` operator, so pipe the file
  through `cmd`:

  ```powershell
  cmd /c "docker exec -i bootleg-spotify-db mysql -uroot --default-character-set=utf8mb4 spotify_db < sql/seed_demo.sql"
  ```

  The `utf8mb4` client charset is not optional — without it the connection
  negotiates latin1 and every accented character is flattened to `?`.
- If you run the Vite dev server yourself, pass `--port 3000 --strictPort`. A
  duplicate instance silently binds 3001, which is the API's port.
- No XAMPP or local PHP is involved; the only requirement is Docker.
