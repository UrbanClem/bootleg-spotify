<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Song.php';
include 'models/Artist.php';
include 'models/Album.php';

Session::init();

$database = new Database();
$db = $database->getConnection();

$song = new Song($db);
$artist = new Artist($db);
$album = new Album($db);

$song->id_cancion = isset($_GET['id']) ? $_GET['id'] : die('ERROR: ID de canción no especificado.');
$song->readOne();

$artists = $artist->read();
$albums = $album->read();

$message = '';

if($_POST){
    // Procesar nuevo archivo de audio si se subió
    $audio_filename = $song->archivo_audio;
    
    // USAR EXCLUSIVAMENTE LA DURACIÓN DEL FORMULARIO (JavaScript)
    $duracion = isset($_POST['duracion']) ? (int)$_POST['duracion'] : $song->duracion;
    
    // Si no hay duración del formulario, usar la manual
    if($duracion == 0 && isset($_POST['duracion_manual']) && $_POST['duracion_manual'] > 0) {
        $duracion = (int)$_POST['duracion_manual'];
    }
    
    // Si aún no hay duración, mantener la actual
    if($duracion == 0) {
        $duracion = $song->duracion;
    }
    
    if($_FILES['archivo_audio']['error'] === UPLOAD_ERR_OK) {
        $audio_file = $_FILES['archivo_audio'];
        $audio_ext = pathinfo($audio_file['name'], PATHINFO_EXTENSION);
        $audio_filename = uniqid() . '.' . $audio_ext;
        $audio_dest = 'uploads/audio/' . $audio_filename;
        
        if(move_uploaded_file($audio_file['tmp_name'], $audio_dest)) {
            // CONFIRMAR QUE TENEMOS UNA DURACIÓN VÁLIDA
            if($duracion > 0 && $duracion != $song->duracion) {
                $message .= '<div class="alert alert-info">Nueva duración establecida: ' . gmdate("i:s", $duracion) . '</div>';
            }
            
            // Eliminar archivo anterior si existe
            if(!empty($song->archivo_audio) && file_exists('uploads/audio/' . $song->archivo_audio)) {
                @unlink('uploads/audio/' . $song->archivo_audio);
            }
        } else {
            $message .= '<div class="alert alert-danger">Error al subir el nuevo archivo de audio.</div>';
        }
    }

    $song->titulo = $_POST['titulo'];
    $song->duracion = $duracion;
    $song->id_artista = $_POST['id_artista'];
    $song->id_album = $_POST['id_album'];
    $song->fecha_lanzamiento = $_POST['fecha_lanzamiento'];
    $song->archivo_audio = $audio_filename;
    $song->letra = $_POST['letra'];
    $song->explicit = isset($_POST['explicit']) ? 1 : 0;

    if($song->update()){
        $message .= '<div class="alert alert-success">Canción actualizada exitosamente. Duración: ' . gmdate("i:s", $duracion) . '</div>';
    } else {
        $message .= '<div class="alert alert-danger">Error al actualizar la canción.</div>';
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Canción - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="card" style="background: #282828; border: none;">
                    <div class="card-header" style="background: #1db954; color: white;">
                        <h4>Editar Canción: <?php echo $song->titulo; ?></h4>
                    </div>
                    <div class="card-body">
                        <?php echo $message; ?>
                        
                        <!-- Mostrar imagen del álbum si existe -->
                        <?php if(!empty($song->portada_album)): ?>
                            <div class="mb-3 text-center">
                                <img src="uploads/images/<?php echo $song->portada_album; ?>" 
                                     alt="Portada del álbum" style="max-width: 200px; border-radius: 10px;">
                                <p class="text-muted mt-2">Portada del álbum: <?php echo $song->titulo_album ?: 'Single'; ?></p>
                            </div>
                        <?php endif; ?>

                        <form method="POST" enctype="multipart/form-data" id="songForm">
                            <!-- Campo hidden para la duración -->
                            <input type="hidden" name="duracion" id="duracionHidden" value="<?php echo $song->duracion; ?>">
                            
                            <div class="mb-3">
                                <label class="form-label">Título *</label>
                                <input type="text" class="form-control" name="titulo" value="<?php echo $song->titulo; ?>" required>
                            </div>
                            
                            <!-- Información del archivo actual -->
                            <div class="mb-3 alert alert-secondary">
                                <strong>Archivo de audio actual:</strong> 
                                <?php echo $song->archivo_audio ?: 'Ninguno'; ?><br>
                                <strong>Duración actual:</strong> 
                                <?php echo gmdate("i:s", $song->duracion); ?> (<?php echo $song->duracion; ?> segundos)
                            </div>
                            
                            <!-- Archivo de Audio -->
                            <div class="mb-3">
                                <label class="form-label">Nuevo Archivo de Audio (Opcional)</label>
                                <input type="file" class="form-control" name="archivo_audio" id="archivo_audio" accept=".mp3,.wav,.ogg,.m4a,.flac">
                                <small class="form-text text-muted">
                                    Formatos aceptados: MP3, WAV, OGG, M4A, FLAC<br>
                                    <strong>La duración se detectará automáticamente en tu navegador.</strong>
                                </small>
                            </div>
                            
                            <!-- Mostrar nueva duración detectada -->
                            <div class="mb-3 alert alert-success" id="nuevaDuracionInfo" style="display: none;">
                                <strong>✓ Nueva duración detectada:</strong> <span id="nuevaDuracionTexto"></span>
                                <br><small>Esta duración se guardará automáticamente.</small>
                            </div>
                            
                            <!-- Campo de duración manual (como fallback) -->
                            <div class="mb-3" id="duracionManualContainer" style="display: none;">
                                <label class="form-label">Duración Manual (segundos) *</label>
                                <input type="number" class="form-control" name="duracion_manual" id="duracion_manual" 
                                       value="<?php echo $song->duracion; ?>" min="1" required>
                                <small class="form-text text-muted">Usar solo si la detección automática falla</small>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Artista *</label>
                                <select class="form-control" name="id_artista" required>
                                    <option value="">Seleccionar Artista</option>
                                    <?php foreach ($artists as $artistItem): ?>
                                        <?php $selected = ($artistItem['id_artista'] == $song->id_artista) ? 'selected' : ''; ?>
                                        <option value="<?php echo $artistItem['id_artista']; ?>" <?php echo $selected; ?>>
                                            <?php echo $artistItem['nombre_artista']; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Álbum (Opcional)</label>
                                <select class="form-control" name="id_album">
                                    <option value="">Seleccionar Álbum</option>
                                    <?php foreach ($albums as $albumItem): ?>
                                        <?php $selected = ($albumItem['id_album'] == $song->id_album) ? 'selected' : ''; ?>
                                        <option value="<?php echo $albumItem['id_album']; ?>" <?php echo $selected; ?>>
                                            <?php echo $albumItem['titulo']; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                                <small class="form-text text-muted">La imagen de portada se tomará del álbum seleccionado</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Fecha de Lanzamiento</label>
                                <input type="date" class="form-control" name="fecha_lanzamiento" value="<?php echo $song->fecha_lanzamiento; ?>">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Letra (Opcional)</label>
                                <textarea class="form-control" name="letra" rows="4"><?php echo $song->letra; ?></textarea>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" name="explicit" id="explicit" <?php echo $song->explicit ? 'checked' : ''; ?>>
                                <label class="form-check-label" for="explicit">Contenido Explícito</label>
                            </div>
                            
                            <button type="submit" class="btn" style="background: #1db954; color: white;" id="submitBtn">Actualizar Canción</button>
                            <a href="admin_songs.php" class="btn btn-secondary">Volver</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Detectar duración del audio usando JavaScript
        document.getElementById('archivo_audio').addEventListener('change', function(e) {
            const file = e.target.files[0];
            const submitBtn = document.getElementById('submitBtn');
            const nuevaDuracionInfo = document.getElementById('nuevaDuracionInfo');
            const duracionManualContainer = document.getElementById('duracionManualContainer');
            
            if (file) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Detectando duración...';
                
                const audio = document.createElement('audio');
                audio.preload = 'metadata';
                
                audio.onloadedmetadata = function() {
                    const duracion = Math.round(audio.duration);
                    
                    if (duracion > 0) {
                        nuevaDuracionInfo.style.display = 'block';
                        document.getElementById('nuevaDuracionTexto').textContent = 
                            duracion + ' segundos (' + formatTime(duracion) + ')';
                        document.getElementById('duracionHidden').value = duracion;
                        
                        // Ocultar campo manual si la detección funciona
                        duracionManualContainer.style.display = 'none';
                        document.getElementById('duracion_manual').required = false;
                        
                        console.log('Duración detectada:', duracion, 'segundos');
                    } else {
                        nuevaDuracionInfo.style.display = 'none';
                        // Mostrar campo manual como fallback
                        duracionManualContainer.style.display = 'block';
                        document.getElementById('duracion_manual').required = true;
                        alert('No se pudo detectar la duración automáticamente. Por favor, ingresa la duración manualmente.');
                    }
                    
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Actualizar Canción';
                    
                    // Liberar memoria
                    URL.revokeObjectURL(audio.src);
                };
                
                audio.onerror = function() {
                    nuevaDuracionInfo.style.display = 'none';
                    duracionManualContainer.style.display = 'block';
                    document.getElementById('duracion_manual').required = true;
                    alert('Error al cargar el archivo de audio. Por favor, verifica que el archivo sea válido o ingresa la duración manualmente.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Actualizar Canción';
                    
                    // Liberar memoria
                    URL.revokeObjectURL(audio.src);
                };
                
                audio.src = URL.createObjectURL(file);
            } else {
                // Si no se selecciona archivo, ocultar los mensajes
                nuevaDuracionInfo.style.display = 'none';
                duracionManualContainer.style.display = 'none';
                document.getElementById('duracion_manual').required = false;
                document.getElementById('duracionHidden').value = '<?php echo $song->duracion; ?>';
            }
        });
        
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
        }
        
        // Validar formulario antes de enviar si hay nuevo archivo
        document.getElementById('songForm').addEventListener('submit', function(e) {
            const archivoAudio = document.getElementById('archivo_audio').value;
            const duracion = document.getElementById('duracionHidden').value;
            const duracionManual = document.getElementById('duracion_manual').value;
            const duracionManualContainer = document.getElementById('duracionManualContainer');
            
            if (archivoAudio) {
                if (!duracion && !duracionManual) {
                    e.preventDefault();
                    alert('Por favor, espera a que se detecte la duración del audio o ingrésala manualmente.');
                    duracionManualContainer.style.display = 'block';
                    document.getElementById('duracion_manual').required = true;
                    document.getElementById('duracion_manual').focus();
                } else if (duracionManual && (!duracion || duracion == '<?php echo $song->duracion; ?>')) {
                    // Si se ingresó duración manual, usarla
                    document.getElementById('duracionHidden').value = duracionManual;
                }
            }
            
            // Debug: mostrar valores que se enviarán
            console.log('Enviando - Duración:', document.getElementById('duracionHidden').value);
        });
    </script>
</body>
</html>