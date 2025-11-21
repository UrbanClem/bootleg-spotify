<?php
include 'config/database.php';
include 'models/Playlist.php';
include 'models/PlaylistSong.php';
include 'models/Song.php';
include 'config/session.php';

Session::init();
if (!Session::isLoggedIn()) {
    header("Location: login.php");
    exit();
}

$database = new Database();
$db = $database->getConnection();

$playlist_id = $_GET['id'] ?? 0;
$user_id = Session::get('user_id');

// Verificar que la playlist pertenece al usuario
$playlist = new Playlist($db);
$playlist->id_playlist = $playlist_id;
$playlist->id_usuario = $user_id;

if(!$playlist->readOne()) {
    header("Location: playlists.php");
    exit();
}

$playlistSong = new PlaylistSong($db);
$playlistSong->id_playlist = $playlist_id;

$song = new Song($db);

$message = '';

// Agregar canción a playlist
if($_POST && isset($_POST['add_song'])) {
    $playlistSong->id_cancion = $_POST['id_cancion'];
    
    if($playlistSong->addSong()) {
        $message = '<div class="alert alert-success">Canción agregada a la playlist.</div>';
    } else {
        $message = '<div class="alert alert-danger">La canción ya está en la playlist.</div>';
    }
}

// Remover canción de playlist
if(isset($_GET['remove_song'])) {
    $playlistSong->id_cancion = $_GET['remove_song'];
    
    if($playlistSong->removeSong()) {
        $message = '<div class="alert alert-success">Canción removida de la playlist.</div>';
    } else {
        $message = '<div class="alert alert-danger">Error al remover la canción.</div>';
    }
}

// Obtener canciones de la playlist
$songs_stmt = $playlistSong->getSongs();
$songs = $songs_stmt->fetchAll(PDO::FETCH_ASSOC);

// Obtener todas las canciones disponibles
$all_songs_stmt = $song->read();
$all_songs = $all_songs_stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($playlist->nombre_playlist); ?> - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #1db954, #191414);
            min-height: 100vh;
            padding: 20px 0;
        }
        .playlist-header {
            background: rgba(0, 0, 0, 0.5);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 20px;
            color: white;
        }
        .song-item {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            color: white;
            transition: background 0.3s ease;
        }
        .song-item:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .btn-spotify {
            background: #1db954;
            border: none;
            color: white;
            font-weight: bold;
        }
        .btn-spotify:hover {
            background: #1ed760;
        }
        .btn-spotify-sm {
            background: #1db954;
            color: white;
            border: none;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
        }
        .btn-spotify-sm:hover {
            background: #1ed760;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <!-- Header de la Playlist -->
                <div class="playlist-header">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h1><?php echo htmlspecialchars($playlist->nombre_playlist); ?></h1>
                            <p class="text-muted"><?php echo htmlspecialchars($playlist->descripcion); ?></p>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-spotify me-2">
                                    <?php echo count($songs); ?> canciones
                                </span>
                                <?php if($playlist->privada): ?>
                                    <span class="badge bg-secondary">
                                        <i class="fas fa-lock"></i> Privada
                                    </span>
                                <?php else: ?>
                                    <span class="badge bg-info">
                                        <i class="fas fa-globe"></i> Pública
                                    </span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <a href="playlists.php" class="btn btn-outline-light">
                                <i class="fas fa-arrow-left"></i> Volver
                            </a>
                        </div>
                    </div>
                </div>

                <?php echo $message; ?>

                <!-- Agregar Canción -->
                <div class="card mb-4">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0">Agregar Canción a la Playlist</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" class="row g-3">
                            <div class="col-md-8">
                                <select class="form-select" name="id_cancion" required>
                                    <option value="">Seleccionar canción...</option>
                                    <?php foreach($all_songs as $song_item): ?>
                                        <option value="<?php echo $song_item['id_cancion']; ?>">
                                            <?php echo htmlspecialchars($song_item['titulo']); ?> - 
                                            <?php echo htmlspecialchars($song_item['nombre_artista']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <button type="submit" name="add_song" class="btn btn-spotify w-100">
                                    <i class="fas fa-plus"></i> Agregar Canción
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Lista de Canciones -->
                <div class="card">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0">Canciones en la Playlist</h5>
                    </div>
                    <div class="card-body">
                        <?php if(count($songs) > 0): ?>
                            <?php foreach($songs as $song_item): ?>
                                <div class="song-item">
                                    <div class="row align-items-center">
                                        <div class="col-md-1 text-center">
                                            <span class="text-muted"><?php echo $song_item['orden']; ?></span>
                                        </div>
                                        <div class="col-md-5">
                                            <h6 class="mb-1"><?php echo htmlspecialchars($song_item['titulo']); ?></h6>
                                            <p class="mb-0 text-muted"><?php echo htmlspecialchars($song_item['nombre_artista']); ?></p>
                                        </div>
                                        <div class="col-md-2">
                                            <span class="text-muted">
                                                <?php 
                                                    $minutes = floor($song_item['duracion'] / 60);
                                                    $seconds = $song_item['duracion'] % 60;
                                                    echo sprintf("%d:%02d", $minutes, $seconds);
                                                ?>
                                            </span>
                                        </div>
                                        <div class="col-md-4 text-end">
                                            <?php if(!empty($song_item['archivo_audio'])): ?>
                                                <button class="btn btn-spotify-sm play-song-btn me-2" 
                                                        data-song-src="uploads/audio/<?php echo $song_item['archivo_audio']; ?>"
                                                        data-song-title="<?php echo htmlspecialchars($song_item['titulo']); ?>"
                                                        data-song-artist="<?php echo htmlspecialchars($song_item['nombre_artista']); ?>"
                                                        data-song-cover="<?php echo !empty($song_item['portada_album']) ? 'uploads/images/' . $song_item['portada_album'] : 'assets/default-cover.jpg'; ?>">
                                                    <i class="fas fa-play"></i> Reproducir
                                                </button>
                                            <?php endif; ?>
                                            <a href="?id=<?php echo $playlist_id; ?>&remove_song=<?php echo $song_item['id_cancion']; ?>" 
                                               class="btn btn-sm btn-danger"
                                               onclick="return confirm('¿Estás seguro de remover esta canción?')">
                                                <i class="fas fa-trash"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <div class="text-center py-4">
                                <i class="fas fa-music fa-3x text-muted mb-3"></i>
                                <p class="text-muted">No hay canciones en esta playlist aún.</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Script para el reproductor global -->
    <script>
    // Agregar event listeners a los botones de reproducción
    document.querySelectorAll('.play-song-btn').forEach(button => {
        button.addEventListener('click', function() {
            const songData = {
                src: this.dataset.songSrc,
                title: this.dataset.songTitle,
                artist: this.dataset.songArtist,
                cover: this.dataset.songCover
            };
            
            if (window.playSong) {
                window.playSong(songData);
            }
        });
    });
    </script>
    
    <?php include 'components/player.php'; ?>
</body>
</html>