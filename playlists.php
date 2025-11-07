<?php
include 'config/database.php';
include 'models/Playlist.php';
include 'config/session.php';

Session::init();
if (!Session::isLoggedIn()) {
    header("Location: login.php");
    exit();
}

$database = new Database();
$db = $database->getConnection();
$playlist = new Playlist($db);

$user_id = Session::get('user_id');
$playlist->id_usuario = $user_id;

$message = '';

// Crear nueva playlist
if($_POST && isset($_POST['create_playlist'])) {
    $playlist->nombre_playlist = $_POST['nombre_playlist'];
    $playlist->descripcion = $_POST['descripcion'];
    $playlist->privada = isset($_POST['privada']) ? 1 : 0;

    if($playlist->create()) {
        $message = '<div class="alert alert-success">Playlist creada exitosamente.</div>';
    } else {
        $message = '<div class="alert alert-danger">Error al crear la playlist.</div>';
    }
}

// Obtener playlists del usuario
$stmt = $playlist->readByUser();
$playlists = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Playlists - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #1db954, #191414);
            min-height: 100vh;
            padding: 20px 0;
        }
        .playlist-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            color: white;
            transition: transform 0.3s ease;
        }
        .playlist-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.15);
        }
        .playlist-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 15px;
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
        .modal-content {
            background: #191414;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="text-white">Mis Playlists</h1>
                    <button class="btn btn-spotify" data-bs-toggle="modal" data-bs-target="#createPlaylistModal">
                        <i class="fas fa-plus"></i> Nueva Playlist
                    </button>
                </div>
                
                <?php echo $message; ?>
                
                <div class="row">
                    <?php if(count($playlists) > 0): ?>
                        <?php foreach($playlists as $pl): ?>
                            <div class="col-md-4">
                                <div class="playlist-card">
                                    <div class="playlist-header">
                                        <h5><?php echo htmlspecialchars($pl['nombre_playlist']); ?></h5>
                                        <?php if($pl['privada']): ?>
                                            <i class="fas fa-lock text-muted"></i>
                                        <?php else: ?>
                                            <i class="fas fa-globe text-muted"></i>
                                        <?php endif; ?>
                                    </div>
                                    <p class="text-muted"><?php echo htmlspecialchars($pl['descripcion']); ?></p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="badge bg-spotify">
                                            <?php echo $pl['total_canciones']; ?> canciones
                                        </span>
                                        <div>
                                            <a href="playlist_detail.php?id=<?php echo $pl['id_playlist']; ?>" 
                                               class="btn btn-sm btn-spotify">
                                                <i class="fas fa-play"></i> Abrir
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="col-12">
                            <div class="playlist-card text-center">
                                <i class="fas fa-music fa-3x mb-3 text-muted"></i>
                                <h4>No tienes playlists aún</h4>
                                <p class="text-muted">Crea tu primera playlist para empezar a organizar tu música.</p>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Crear Playlist -->
    <div class="modal fade" id="createPlaylistModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Crear Nueva Playlist</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Nombre de la playlist</label>
                            <input type="text" class="form-control" name="nombre_playlist" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <textarea class="form-control" name="descripcion" rows="3"></textarea>
                        </div>
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" name="privada" id="privada">
                            <label class="form-check-label" for="privada">
                                Playlist privada
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" name="create_playlist" class="btn btn-spotify">Crear Playlist</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>