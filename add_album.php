<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Album.php';
include 'models/Artist.php';

Session::init();

$database = new Database();
$db = $database->getConnection();

$album = new Album($db);
$artist = new Artist($db);

$artists = $artist->read();

$message = '';

if($_POST){
    // Procesar imagen de portada
    $portada_filename = '';
    if($_FILES['portada']['error'] === UPLOAD_ERR_OK) {
        $portada_file = $_FILES['portada'];
        $portada_ext = pathinfo($portada_file['name'], PATHINFO_EXTENSION);
        $allowed_ext = ['jpg', 'jpeg', 'png', 'gif'];
        
        if(in_array(strtolower($portada_ext), $allowed_ext)) {
            $portada_filename = uniqid() . '.' . $portada_ext;
            $portada_dest = 'uploads/images/' . $portada_filename;
            
            if(!move_uploaded_file($portada_file['tmp_name'], $portada_dest)) {
                $message = '<div class="alert alert-danger">Error al subir la imagen de portada.</div>';
            }
        } else {
            $message = '<div class="alert alert-danger">Formato de imagen no válido. Use JPG, PNG o GIF.</div>';
        }
    }

    if(empty($message)) {
        $album->titulo = $_POST['titulo'];
        $album->id_artista = $_POST['id_artista'];
        $album->fecha_lanzamiento = $_POST['fecha_lanzamiento'];
        $album->portada = $portada_filename;
        $album->genero = $_POST['genero'];

        if($album->create()){
            header("Location: albums.php?message=created");
            exit();
        } else {
            $message = '<div class="alert alert-danger">Error al crear el álbum.</div>';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Álbum - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="card" style="background: #282828; border: none;">
                    <div class="card-header" style="background: #1db954; color: white;">
                        <h4><i class="fas fa-plus me-2"></i>Agregar Nuevo Álbum</h4>
                    </div>
                    <div class="card-body">
                        <?php echo $message; ?>
                        <form method="POST" enctype="multipart/form-data">
                            <div class="mb-3">
                                <label class="form-label">Título del Álbum *</label>
                                <input type="text" class="form-control" name="titulo" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Artista *</label>
                                <select class="form-control" name="id_artista" required>
                                    <option value="">Seleccionar Artista</option>
                                    <?php foreach ($artists as $artistItem): ?>
                                        <option value="<?php echo $artistItem['id_artista']; ?>">
                                            <?php echo $artistItem['nombre_artista']; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Fecha de Lanzamiento *</label>
                                <input type="date" class="form-control" name="fecha_lanzamiento" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Género *</label>
                                <input type="text" class="form-control" name="genero" required 
                                       placeholder="Ej: Rock, Pop, Reggaeton, Electrónica...">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Portada del Álbum</label>
                                <input type="file" class="form-control" name="portada" accept=".jpg,.jpeg,.png,.gif">
                                <small class="form-text text-muted">Formatos aceptados: JPG, PNG, GIF (Recomendado: 500x500 px)</small>
                            </div>
                            
                            <button type="submit" class="btn" style="background: #1db954; color: white;">
                                <i class="fas fa-save me-2"></i>Crear Álbum
                            </button>
                            <a href="albums.php" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-2"></i>Volver
                            </a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php include 'components/player.php'; ?>
</body>
</html> 