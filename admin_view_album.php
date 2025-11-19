<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Album.php';

Session::init();

$database = new Database();
$db = $database->getConnection();
$album = new Album($db);

$album->id_album = isset($_GET['id']) ? $_GET['id'] : die('ERROR: ID de álbum no especificado.');
$album->readOne();

// Obtener canciones del álbum
$canciones = $album->getCanciones();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $album->titulo; ?> - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row mb-4">
            <div class="col-md-12">
                <a href="admin_albums.php" class="btn btn-secondary mb-3">
                    <i class="fas fa-arrow-left me-2"></i>Volver a Álbumes
                </a>
            </div>
        </div>

        <div class="row">
            <!-- Portada e información del álbum -->
            <div class="col-md-4">
                <?php if(!empty($album->portada)): ?>
                    <img src="uploads/images/<?php echo $album->portada; ?>" 
                         class="img-fluid rounded" alt="<?php echo htmlspecialchars($album->titulo); ?>"
                         style="max-height: 400px; object-fit: cover;">
                <?php else: ?>
                    <div class="bg-dark rounded d-flex align-items-center justify-content-center" 
                         style="height: 400px;">
                        <i class="fas fa-compact-disc" style="font-size: 4rem; color: #1db954;"></i>
                    </div>
                <?php endif; ?>
            </div>
            
            <!-- Información del álbum -->
            <div class="col-md-8">
                <h1 class="display-4"><?php echo htmlspecialchars($album->titulo); ?></h1>
                <p class="lead">Por: <?php echo htmlspecialchars($album->nombre_artista); ?></p>
                
                <div class="album-info mb-4">
                    <p><strong><i class="fas fa-calendar me-2"></i>Fecha de Lanzamiento:</strong> 
                       <?php echo date('d/m/Y', strtotime($album->fecha_lanzamiento)); ?></p>
                    <p><strong><i class="fas fa-music me-2"></i>Género:</strong> <?php echo htmlspecialchars($album->genero); ?></p>
                </div>
                
                <div class="btn-group">
                    <a href="edit_album.php?id=<?php echo $album->id_album; ?>" class="btn btn-warning">
                        <i class="fas fa-edit me-2"></i>Editar Álbum
                    </a>
                    <a href="add_song.php?album_id=<?php echo $album->id_album; ?>" class="btn" style="background: #1db954; color: white;">
                        <i class="fas fa-plus me-2"></i>Agregar Canción
                    </a>
                </div>
            </div>
        </div>

        <!-- Lista de canciones -->
        <div class="row mt-5">
            <div class="col-12">
                <h3><i class="fas fa-list me-2"></i>Canciones del Álbum</h3>
                
                <?php if($canciones->rowCount() > 0): ?>
                    <div class="table-responsive">
                        <table class="table table-dark table-striped">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Título</th>
                                    <th>Duración</th>
                                    <th>Popularidad</th>
                                    <th>Audio</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php $counter = 1; ?>
                                <?php while ($cancion = $canciones->fetch(PDO::FETCH_ASSOC)): ?>
                                    <tr>
                                        <td><?php echo $counter++; ?></td>
                                        <td><?php echo htmlspecialchars($cancion['titulo']); ?></td>
                                        <td><?php echo gmdate("i:s", $cancion['duracion']); ?></td>
                                        <td>
                                            <span class="badge bg-success"><?php echo $cancion['popularidad']; ?></span>
                                        </td>
                                        <td>
                                            <?php if(!empty($cancion['archivo_audio'])): ?>
                                                <audio controls style="height: 30px;">
                                                    <source src="uploads/audio/<?php echo $cancion['archivo_audio']; ?>" type="audio/mpeg">
                                                </audio>
                                            <?php else: ?>
                                                <span class="badge bg-warning">Sin audio</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <a href="edit_song.php?id=<?php echo $cancion['id_cancion']; ?>" class="btn btn-sm btn-warning">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                        </td>
                                    </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="alert alert-info text-center py-4">
                        <i class="fas fa-music fa-2x mb-3"></i>
                        <h4>No hay canciones en este álbum</h4>
                        <p class="mb-0">Agrega la primera canción a este álbum.</p>
                        <a href="add_song.php?album_id=<?php echo $album->id_album; ?>" class="btn mt-3" style="background: #1db954; color: white;">
                            <i class="fas fa-plus me-2"></i>Agregar Primera Canción
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>