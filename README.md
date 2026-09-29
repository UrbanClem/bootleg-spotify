# Bootleg Spotify - React Edition

A full-stack Spotify clone built with React, Node.js, Express, and MySQL.

## Project Structure

```
bootleg-spotify/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth, Player)
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin panel pages
│   │   ├── App.jsx         # Main app with routing
│   │   ├── main.jsx        # Entry point
│   │   └── api.js          # Axios instance
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend (Express)
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── server.js           # Entry point
│   └── package.json
├── uploads/                # Uploaded files (audio, images)
└── sql/                    # Database schema
```

## Prerequisites

- Node.js 18+
- MySQL (or XAMPP)
- npm

## Setup

### 1. Database

Start MySQL and create the database:

```bash
mysql -u root -p < sql/spotify_db.sql
```

Or import via phpMyAdmin.

### 2. Backend

```bash
cd server
npm install
npm run dev
```

API runs on http://localhost:3001

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

App runs on http://localhost:3000

## Default Users

| Email | Password | Type |
|-------|----------|------|
| test@email.com | (check DB) | Admin |
| premium@email.com | (check DB) | Premium |

## Features

- User authentication (login/register)
- Role-based access (Free, Premium, Admin)
- Song, Album, Artist management
- Playlist creation and management
- Global audio player with queue
- Search functionality
- Admin panel for content management
- File uploads (audio, images)

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Songs
- GET /api/songs
- GET /api/songs/:id
- POST /api/songs (admin)
- PUT /api/songs/:id (admin)
- DELETE /api/songs/:id (admin)

### Albums
- GET /api/albums
- GET /api/albums/:id
- POST /api/albums (admin)
- PUT /api/albums/:id (admin)
- DELETE /api/albums/:id (admin)

### Artists
- GET /api/artists
- GET /api/artists/:id
- POST /api/artists (admin)
- PUT /api/artists/:id (admin)
- DELETE /api/artists/:id (admin)

### Playlists
- GET /api/playlists
- GET /api/playlists/:id
- POST /api/playlists
- PUT /api/playlists/:id
- DELETE /api/playlists/:id
- POST /api/playlists/:id/songs
- DELETE /api/playlists/:id/songs/:songId

### Search
- GET /api/search/songs?q=
- GET /api/search/albums?q=
- GET /api/search/artists?q=

### Uploads
- POST /api/upload/audio (admin)
- POST /api/upload/image (admin)
