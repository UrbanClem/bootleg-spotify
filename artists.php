<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Artist.php';

Session::init();
Session::requireAdmin();

$database = new Database();
$db = $database->getConnection();
$artist = new Artist($db);

$message = '';

// Crear nuevo artista
if($_POST && isset($_POST['create_artist'])) {
    $artist->nombre_artista = $_POST['nombre_artista'];
    $artist->verificado = isset($_POST['verificado']) ? 1 : 0;
    $artist->biografia = $_POST['biografia'];

    if($artist->create()) {
        $message = '<div class="alert alert-success alert-dismissible fade show" role="alert">
                    Artista creado exitosamente.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>';
    } else {
        $message = '<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    Error al crear el artista.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>';
    }
}

// Eliminar artista
if(isset($_GET['delete_artist'])) {
    $artist->id_artista = $_GET['delete_artist'];
    if($artist->delete()) {
        $message = '<div class="alert alert-success alert-dismissible fade show" role="alert">
                    Artista eliminado exitosamente.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>';
    } else {
        $message = '<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    Error al eliminar el artista.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>';
    }
}

// Leer artistas
$stmt = $artist->read();
$artists = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artistas - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .artist-card {
            transition: transform 0.2s;
            background: #282828 !important;
            border: none;
        }
        .artist-card:hover {
            transform: translateY(-5px);
        }
        .no-image-placeholder {
            height: 200px;
            background: linear-gradient(135deg, #1db954, #191414);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .verified-badge {
            background: #1db954;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        .stats-badge {
            background: rgba(255, 255, 255, 0.1);
            color: #b3b3b3;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 0.8em;
        }
        .biografia-truncada {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <!-- Navegación -->
        <div class="row mb-4">
            <div class="col-md-12">
                <a href="dashboard.php" class="btn btn-secondary mb-3">
                    <i class="fas fa-arrow-left me-2"></i>Volver a Dashboard
                </a>
            </div>
        </div>

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-microphone me-2"></i>Artistas</h2>
        </div>

        <?php echo $message; ?>

        <!-- Barra de búsqueda -->
        <div class="row mb-4">
            <div class="col-md-6">
                <form method="GET" action="search_artists.php">
                    <div class="input-group">
                        <input type="text" class="form-control" name="search" placeholder="Buscar artistas...">
                        <button class="btn btn-outline-light" type="submit"><i class="fas fa-search"></i> Buscar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Lista de Artistas -->
        <div class="row">
            <?php if(count($artists) > 0): ?>
                <?php foreach ($artists as $artistItem): ?>
                    <div class="col-md-4 mb-4">
                        <div class="card artist-card">
                            <!-- Imagen del artista -->
                            <?php if(!empty($artistItem['foto_perfil'])): ?>
                                <img src="uploads/artists/<?php echo $artistItem['foto_perfil']; ?>" 
                                     class="card-img-top" alt="<?php echo htmlspecialchars($artistItem['nombre_artista']); ?>"
                                     style="height: 250px; object-fit: cover;">
                            <?php else: ?>
                                <div class="no-image-placeholder">
                                    <i class="fas fa-user" style="font-size: 4rem;"></i>
                                </div>
                            <?php endif; ?>
                            
                            <div class="card-body">
                                <!-- Header con nombre y verificado -->
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title mb-0"><?php echo htmlspecialchars($artistItem['nombre_artista']); ?></h5>
                                    <?php if($artistItem['verificado']): ?>
                                        <span class="verified-badge">
                                            <i class="fas fa-check"></i> Verificado
                                        </span>
                                    <?php endif; ?>
                                </div>

                                <!-- Estadísticas -->
                                <div class="d-flex gap-2 mb-3">
                                    <span class="stats-badge">
                                        <i class="fas fa-users me-1"></i><?php echo $artistItem['seguidores']; ?> seguidores
                                    </span>
                                    <span class="stats-badge">
                                        <i class="fas fa-music me-1"></i><?php echo $artistItem['total_canciones']; ?> canciones
                                    </span>
                                </div>

                                <!-- Biografía -->
                                <?php if(!empty($artistItem['biografia'])): ?>
                                    <p class="card-text biografia-truncada">
                                        <small class="text-muted"><?php echo htmlspecialchars($artistItem['biografia']); ?></small>
                                    </p>
                                <?php else: ?>
                                    <p class="card-text">
                                        <small class="text-muted"><i>Sin biografía</i></small>
                                    </p>
                                <?php endif; ?>


                                <!-- Botones de acción -->
                                <div class="btn-group w-100">
                                    <a href="admin_view_artist.php?id=<?php echo $artistItem['id_artista']; ?>" class="btn btn-sm btn-info">
                                        <i class="fas fa-eye me-1"></i>Ver
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="col-12">
                    <div class="alert alert-info text-center py-4">
                        <i class="fas fa-microphone fa-2x mb-3"></i>
                        <h4>No hay artistas registrados</h4>
                        <p class="mb-0">Comienza agregando el primer artista a tu biblioteca musical.</p>
                        <button class="btn mt-3" style="background: #1db954; color: white;" data-bs-toggle="modal" data-bs-target="#createArtistModal">
                            <i class="fas fa-plus me-2"></i>Agregar Primer Artista
                        </button>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Modal Crear Artista -->
    <div class="modal fade" id="createArtistModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="background: #282828; color: white;">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title">Crear Nuevo Artista</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <label class="form-label">Nombre del Artista *</label>
                                <input type="text" class="form-control" name="nombre_artista" required 
                                       placeholder="Ej: Bad Bunny, Taylor Swift...">
                            </div>
                            <div class="col-md-12 mb-3">
                                <label class="form-label">Biografía</label>
                                <textarea class="form-control" name="biografia" rows="4" 
                                          placeholder="Describe la carrera musical, logros, estilo..."></textarea>
                            </div>
                            <div class="col-md-12 mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="verificado" id="verificado" value="1">
                                    <label class="form-check-label" for="verificado">
                                        Artista Verificado
                                    </label>
                                    <div class="form-text text-muted">
                                        Los artistas verificados muestran un badge de autenticidad.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" name="create_artist" class="btn" style="background: #1db954; color: white;">
                            <i class="fas fa-plus me-2"></i>Crear Artista
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <?php include 'components/player.php'; ?>
</body>
</html>