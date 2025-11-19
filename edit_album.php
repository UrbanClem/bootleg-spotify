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

$album->id_album = isset($_GET['id']) ? $_GET['id'] : die('ERROR: ID de álbum no especificado.');
$album->readOne();

$artists = $artist->read();

$message = '';

if($_POST){
    // Procesar nueva imagen de portada si se subió
    $portada_filename = $album->portada;
    
    if($_FILES['portada']['error'] === UPLOAD_ERR_OK) {
        $portada_file = $_FILES['portada'];
        $portada_ext = pathinfo($portada_file['name'], PATHINFO_EXTENSION);
        $allowed_ext = ['jpg', 'jpeg', 'png', 'gif'];
        
        if(in_array(strtolower($portada_ext), $allowed_ext)) {
            $portada_filename = uniqid() . '.' . $portada_ext;
            $portada_dest = 'uploads/images/' . $portada_filename;
            
            if(move_uploaded_file($portada_file['tmp_name'], $portada_dest)) {
                // Eliminar imagen anterior si existe
                if(!empty($album->portada)) {
                    @unlink('uploads/images/' . $album->portada);
                }
            } else {
                $message .= '<div class="alert alert-danger">Error al subir la nueva imagen de portada.</div>';
            }
        } else {
            $message .= '<div class="alert alert-danger">Formato de imagen no válido. Use JPG, PNG o GIF.</div>';
        }
    }

    if(empty($message)) {
        $album->titulo = $_POST['titulo'];
        $album->id_artista = $_POST['id_artista'];
        $album->fecha_lanzamiento = $_POST['fecha_lanzamiento'];
        $album->portada = $portada_filename;
        $album->genero = $_POST['genero'];

        if($album->update()){
            header("Location: albums.php?message=updated");
            exit();
        } else {
            $message = '<div class="alert alert-danger">Error al actualizar el álbum.</div>';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Álbum - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="card" style="background: #282828; border: none;">
                    <div class="card-header" style="background: #1db954; color: white;">
                        <h4><i class="fas fa-edit me-2"></i>Editar Álbum: <?php echo $album->titulo; ?></h4>
                    </div>
                    <div class="card-body">
                        <?php echo $message; ?>
                        
                        <!-- Mostrar portada actual -->
                        <?php if(!empty($album->portada)): ?>
                            <div class="mb-4 text-center">
                                <img src="uploads/images/<?php echo $album->portada; ?>" 
                                     alt="Portada actual" 
                                     style="max-width: 300px; border-radius: 10px; border: 3px solid #1db954;">
                                <p class="text-muted mt-2">Portada actual</p>
                            </div>
                        <?php else: ?>
                            <div class="mb-4 text-center">
                                <div class="bg-dark rounded d-flex align-items-center justify-content-center" 
                                     style="height: 200px; max-width: 300px; margin: 0 auto;">
                                    <i class="fas fa-compact-disc" style="font-size: 3rem; color: #1db954;"></i>
                                </div>
                                <p class="text-muted mt-2">Sin portada actual</p>
                            </div>
                        <?php endif; ?>

                        <form method="POST" enctype="multipart/form-data">
                            <div class="mb-3">
                                <label class="form-label">Título del Álbum *</label>
                                <input type="text" class="form-control" name="titulo" 
                                       value="<?php echo htmlspecialchars($album->titulo); ?>" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Artista *</label>
                                <select class="form-control" name="id_artista" required>
                                    <option value="">Seleccionar Artista</option>
                                    <?php foreach ($artists as $artistItem): ?>
                                        <?php $selected = ($artistItem['id_artista'] == $album->id_artista) ? 'selected' : ''; ?>
                                        <option value="<?php echo $artistItem['id_artista']; ?>" <?php echo $selected; ?>>
                                            <?php echo $artistItem['nombre_artista']; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Fecha de Lanzamiento *</label>
                                <input type="date" class="form-control" name="fecha_lanzamiento" 
                                       value="<?php echo $album->fecha_lanzamiento; ?>" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Género *</label>
                                <input type="text" class="form-control" name="genero" 
                                       value="<?php echo htmlspecialchars($album->genero); ?>" required 
                                       placeholder="Ej: Rock, Pop, Reggaeton, Electrónica...">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Nueva Portada del Álbum (Opcional)</label>
                                <input type="file" class="form-control" name="portada" accept=".jpg,.jpeg,.png,.gif">
                                <small class="form-text text-muted">
                                    Formatos aceptados: JPG, PNG, GIF (Recomendado: 500x500 px)<br>
                                    Dejar vacío para mantener la portada actual.
                                </small>
                            </div>
                            
                            <div class="d-flex justify-content-between">
                                <button type="submit" class="btn" style="background: #1db954; color: white;">
                                    <i class="fas fa-save me-2"></i>Actualizar Álbum
                                </button>
                                
                                <div class="btn-group">
                                    <a href="view_album.php?id=<?php echo $album->id_album; ?>" class="btn btn-info">
                                        <i class="fas fa-eye me-2"></i>Ver Álbum
                                    </a>
                                    <a href="albums.php" class="btn btn-secondary">
                                        <i class="fas fa-arrow-left me-2"></i>Volver
                                    </a>
                                </div>
                            </div>
                        </form>
                        
                        <!-- Información adicional -->
                        <div class="mt-4 pt-3 border-top">
                            <h6><i class="fas fa-info-circle me-2"></i>Información del Álbum</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <small class="text-muted">
                                        <strong>ID del Álbum:</strong> <?php echo $album->id_album; ?>
                                    </small>
                                </div>
                                <div class="col-md-6">
                                    <small class="text-muted">
                                        <strong>Artista Actual:</strong> <?php echo htmlspecialchars($album->nombre_artista); ?>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Preview de la nueva imagen antes de subir
        document.querySelector('input[name="portada"]').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Crear o actualizar preview
                    let preview = document.getElementById('imagePreview');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.id = 'imagePreview';
                        preview.className = 'mb-3 text-center';
                        preview.innerHTML = '<p class="text-muted">Vista previa de la nueva portada:</p>';
                        const img = document.createElement('img');
                        img.style.maxWidth = '300px';
                        img.style.borderRadius = '10px';
                        img.style.border = '3px solid #1db954';
                        preview.appendChild(img);
                        document.querySelector('.card-body').insertBefore(preview, document.querySelector('form'));
                    }
                    
                    const img = preview.querySelector('img');
                    img.src = e.target.result;
                    img.alt = 'Vista previa de la nueva portada';
                }
                reader.readAsDataURL(file);
            } else {
                // Eliminar preview si no hay archivo
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.remove();
                }
            }
        });
    </script>
</body>
</html>