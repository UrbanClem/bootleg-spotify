const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const songRoutes = require('./routes/songs');
const albumRoutes = require('./routes/albums');
const artistRoutes = require('./routes/artists');
const playlistRoutes = require('./routes/playlists');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directories exist
const uploadDirs = ['uploads/audio', 'uploads/images', 'uploads/artists'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Bootleg Spotify API is running' });
});

// Deployment diagnostics.
//
// Render's filesystem is ephemeral and the upload directory ships from git, so
// "the audio 404s" is usually one of two things: the container is running an
// older commit, or the files never made it into the build. This endpoint
// reports which, without needing shell access to the host.
app.get('/api/version', (req, res) => {
    const audioDir = path.join(__dirname, 'uploads', 'audio');
    let audioFiles = [];
    try {
        audioFiles = fs.readdirSync(audioDir).filter((f) => !f.startsWith('.'));
    } catch {
        // Directory missing entirely.
    }

    // Where did the process actually start? Render clones the whole repo and
    // then changes into the configured Root Directory, so both the app dir and
    // the repo root are worth reporting.
    const repoRoot = path.resolve(__dirname, '..');
    const ls = (dir) => {
        try {
            return fs.readdirSync(dir).filter((f) => f !== 'node_modules').slice(0, 25);
        } catch {
            return null;
        }
    };
    const countAudio = (dir) => {
        try {
            return fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.wav')).length;
        } catch {
            return null;
        }
    };

    res.json({
        commit: process.env.RENDER_GIT_COMMIT || null,
        app_dir: __dirname,
        app_dir_listing: ls(__dirname),
        repo_root_listing: ls(repoRoot),
        audio_wav_counts: {
            'uploads/audio': countAudio(audioDir),
            '../uploads/audio': countAudio(path.join(repoRoot, 'uploads', 'audio')),
            '../server/uploads/audio': countAudio(path.join(repoRoot, 'server', 'uploads', 'audio'))
        },
        audio_file_count: audioFiles.length,
        sample_audio_files: audioFiles.slice(0, 5)
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!', code: 'server_error' });
});

app.listen(PORT, () => {
    console.log(`Bootleg Spotify API running on http://localhost:${PORT}`);
});
