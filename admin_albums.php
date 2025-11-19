<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Album.php';

Session::init();

$database = new Database();
$db = $database->getConnection();
$album = new Album($db);

// Leer álbumes
$stmt = $album->read();
$albums = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Mostrar mensajes
if(isset($_GET['message'])) {
    $messages = [
        'created' => 'Álbum creado exitosamente.',
        'updated' => 'Álbum actualizado exitosamente.',
        'deleted' => 'Álbum eliminado exitosamente.'
    ];
    
    if(isset($messages[$_GET['message']])) {
        echo '<div class="alert alert-success alert-dismissible fade show" role="alert">
                ' . $messages[$_GET['message']] . '
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
              </div>';
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Álbumes - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .album-card {
            transition: transform 0.2s;
            background: #282828 !important;
            border: none;
        }
        .album-card:hover {
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
        .album-info {
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px;
        }
    </style>
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row mb-4">
            <div class="col-md-12">
                <a href="admin_dashboard.php" class="btn btn-secondary mb-3">
                    <i class="fas fa-arrow-left me-2"></i>Volver a Dashboard
                </a>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-compact-disc me-2"></i>Gestión de Álbumes</h2>
            <a href="add_album.php" class="btn" style="background: #1db954; color: white;">
                <i class="fas fa-plus me-2"></i>Nuevo Álbum
            </a>
        </div>

        <!-- Barra de búsqueda -->
        <div class="row mb-4">
            <div class="col-md-6">
                <form method="GET" action="search_albums.php">
                    <div class="input-group">
                        <input type="text" class="form-control" name="search" placeholder="Buscar álbumes, artistas o géneros...">
                        <button class="btn btn-outline-light" type="submit"><i class="fas fa-search"></i> Buscar</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="row">
            <?php if(count($albums) > 0): ?>
                <?php foreach ($albums as $albumItem): ?>
                    <div class="col-md-4 mb-4">
                        <div class="card album-card">
                            <?php if(!empty($albumItem['portada'])): ?>
                                <img src="uploads/images/<?php echo $albumItem['portada']; ?>" 
                                     class="card-img-top" alt="<?php echo htmlspecialchars($albumItem['titulo']); ?>"
                                     style="height: 250px; object-fit: cover;">
                            <?php else: ?>
                                <div class="no-image-placeholder">
                                    <i class="fas fa-compact-disc" style="font-size: 3rem;"></i>
                                </div>
                            <?php endif; ?>
                            
                            <div class="card-body">
                                <h5 class="card-title"><?php echo htmlspecialchars($albumItem['titulo']); ?></h5>
                                <p class="card-text">
                                    <strong><i class="fas fa-microphone me-1"></i>Artista:</strong> <?php echo htmlspecialchars($albumItem['nombre_artista']); ?><br>
                                    <strong><i class="fas fa-calendar me-1"></i>Lanzamiento:</strong> <?php echo date('d/m/Y', strtotime($albumItem['fecha_lanzamiento'])); ?><br>
                                    <strong><i class="fas fa-music me-1"></i>Género:</strong> <?php echo htmlspecialchars($albumItem['genero']); ?><br>
                                    <strong><i class="fas fa-list me-1"></i>Canciones:</strong> <?php echo $albumItem['total_canciones']; ?>
                                </p>
                                
                                <div class="btn-group w-100">
                                    <a href="admin_view_album.php?id=<?php echo $albumItem['id_album']; ?>" class="btn btn-sm btn-info">
                                        <i class="fas fa-eye me-1"></i>Ver
                                    </a>
                                    <a href="edit_album.php?id=<?php echo $albumItem['id_album']; ?>" class="btn btn-sm btn-warning">
                                        <i class="fas fa-edit me-1"></i>Editar
                                    </a>
                                    <a href="delete_album.php?id=<?php echo $albumItem['id_album']; ?>" class="btn btn-sm btn-danger" 
                                       onclick="return confirm('¿Estás seguro de eliminar este álbum?')">
                                        <i class="fas fa-trash me-1"></i>Eliminar
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="col-12">
                    <div class="alert alert-info text-center py-4">
                        <i class="fas fa-compact-disc fa-2x mb-3"></i>
                        <h4>No hay álbumes registrados</h4>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>