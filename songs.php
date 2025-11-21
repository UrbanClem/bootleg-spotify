<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Song.php';

Session::init();

$database = new Database();
$db = $database->getConnection();
$songModel = new Song($db); // Cambiamos el nombre para evitar conflicto

// Leer canciones
$stmt = $songModel->read();
$songs = $stmt->fetchAll(PDO::FETCH_ASSOC); // Guardar todos los resultados en un array
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Canciones - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .song-card {
            transition: transform 0.2s;
        }
        .song-card:hover {
            transform: translateY(-5px);
        }
        .explicit-badge {
            background: #ff4d4d;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.8em;
        }
        .no-image-placeholder {
            height: 200px;
            background: linear-gradient(135deg, #1db954, #191414);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn-spotify {
            background: #1db954;
            color: white;
            border: none;
        }
        .btn-spotify:hover {
            background: #1ed760;
            color: white;
        }
    </style>
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row mb-4">
            <div class="col-md-12">
                <a href="dashboard.php" class="btn btn-secondary mb-3">
                    <i class="fas fa-arrow-left me-2"></i>Volver a Dashboard
                </a>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-music me-2"></i>Canciones</h2>
        </div>

        <!-- Barra de búsqueda -->
        <div class="row mb-4">
            <div class="col-md-6">
                <form method="GET" action="search_songs.php">
                    <div class="input-group">
                        <input type="text" class="form-control" name="search" placeholder="Buscar canciones o artistas...">
                        <button class="btn btn-outline-light" type="submit"><i class="fas fa-search"></i> Buscar</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="row">
            <?php if(count($songs) > 0): ?>
                <?php foreach ($songs as $songItem): ?>  <!-- Cambiamos $song por $songItem -->
                    <div class="col-md-4 mb-4">
                        <div class="card song-card" style="background: #282828; border: none;">
                            <?php if(!empty($songItem['portada_album'])): ?>
                                <img src="uploads/images/<?php echo $songItem['portada_album']; ?>" 
                                     class="card-img-top" alt="<?php echo htmlspecialchars($songItem['titulo']); ?>"
                                     style="height: 200px; object-fit: cover;">
                            <?php else: ?>
                                <div class="no-image-placeholder">
                                    <i class="fas fa-music" style="font-size: 3rem;"></i>
                                </div>
                            <?php endif; ?>
                            
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <h5 class="card-title"><?php echo htmlspecialchars($songItem['titulo']); ?></h5>
                                    <?php if($songItem['explicit']): ?>
                                        <span class="explicit-badge">E</span>
                                    <?php endif; ?>
                                </div>
                                <p class="card-text">
                                    <strong><i class="fas fa-microphone me-1"></i>Artista:</strong> <?php echo htmlspecialchars($songItem['nombre_artista']); ?><br>
                                    <strong><i class="fas fa-compact-disc me-1"></i>Álbum:</strong> <?php echo $songItem['titulo_album'] ? htmlspecialchars($songItem['titulo_album']) : 'Single'; ?><br>
                                    <strong><i class="fas fa-clock me-1"></i>Duración:</strong> <?php echo gmdate("i:s", $songItem['duracion']); ?><br>
                                    <strong><i class="fas fa-fire me-1"></i>Popularidad:</strong> <?php echo $songItem['popularidad']; ?>
                                </p>
                                
                                <!-- Botón de reproducción para el reproductor global -->
                                <?php if(!empty($songItem['archivo_audio'])): ?>
                                    <button class="btn btn-sm btn-spotify play-song-btn w-100" 
                                            data-song-src="uploads/audio/<?php echo $songItem['archivo_audio']; ?>"
                                            data-song-title="<?php echo htmlspecialchars($songItem['titulo']); ?>"
                                            data-song-artist="<?php echo htmlspecialchars($songItem['nombre_artista']); ?>"
                                            data-song-cover="<?php echo !empty($songItem['portada_album']) ? 'uploads/images/' . $songItem['portada_album'] : 'assets/default-cover.jpg'; ?>">
                                        <i class="fas fa-play"></i> Reproducir
                                    </button>
                                <?php else: ?>
                                    <div class="alert alert-warning text-center py-2">
                                        <small><i class="fas fa-exclamation-triangle me-1"></i>No hay archivo de audio</small>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="col-12">
                    <div class="alert alert-info text-center py-4">
                        <i class="fas fa-music fa-2x mb-3"></i>
                        <h4>No hay canciones registradas</h4>
                    </div>
                </div>
            <?php endif; ?>
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