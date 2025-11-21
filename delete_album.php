<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Album.php';

Session::checkLogin();

$database = new Database();
$db = $database->getConnection();
$album = new Album($db);

$album->id_album = isset($_GET['id']) ? $_GET['id'] : die('ERROR: ID de álbum no especificado.');
$album->readOne();

if($_POST){
    // Eliminar imagen de portada si existe
    if(!empty($album->portada)) {
        @unlink('uploads/images/' . $album->portada);
    }
    
    if($album->delete()){
        header("Location: albums.php?message=deleted");
        exit();
    } else {
        echo "<script>alert('Error al eliminar el álbum'); window.location.href = 'albums.php';</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eliminar Álbum - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-6 mx-auto">
                <div class="card" style="background: #282828; border: none;">
                    <div class="card-header" style="background: #dc3545; color: white;">
                        <h4><i class="fas fa-trash me-2"></i>Eliminar Álbum</h4>
                    </div>
                    <div class="card-body">
                        <p class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>¡Advertencia!</strong> Esta acción no se puede deshacer.
                        </p>
                        
                        <div class="alert alert-danger">
                            <strong>¿Estás seguro de que quieres eliminar el siguiente álbum?</strong><br><br>
                            <strong>Álbum:</strong> <?php echo htmlspecialchars($album->titulo); ?><br>
                            <strong>Artista:</strong> <?php echo htmlspecialchars($album->nombre_artista); ?><br>
                            <strong>Género:</strong> <?php echo htmlspecialchars($album->genero); ?>
                        </div>

                        <form method="POST">
                            <div class="d-flex justify-content-between">
                                <button type="submit" class="btn btn-danger">
                                    <i class="fas fa-trash me-2"></i>Sí, Eliminar
                                </button>
                                <a href="albums.php" class="btn btn-secondary">
                                    <i class="fas fa-times me-2"></i>Cancelar
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</body>
</html>