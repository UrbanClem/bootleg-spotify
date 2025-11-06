<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Song.php';
include 'models/Artist.php';
include 'models/Album.php';

Session::checkLogin();

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

// Función para obtener duración del audio (la misma que en add_song.php)
function getAudioDuration($file_path) {
    // Opción 1: Usar getID3
    if(file_exists('vendor/getid3/getid3.php')) {
        require_once('vendor/getid3/getid3.php');
        $getID3 = new getID3;
        $fileInfo = $getID3->analyze($file_path);
        if(isset($fileInfo['playtime_seconds'])) {
            return round($fileInfo['playtime_seconds']);
        }
    }
    
    // Opción 2: Usar FFmpeg (si está disponible)
    if(function_exists('shell_exec')) {
        $cmd = "ffmpeg -i " . escapeshellarg($file_path) . " 2>&1";
        $output = shell_exec($cmd);
        if(preg_match('/Duration: (\d+):(\d+):(\d+)/', $output, $matches)) {
            $hours = intval($matches[1]);
            $minutes = intval($matches[2]);
            $seconds = intval($matches[3]);
            return ($hours * 3600) + ($minutes * 60) + $seconds;
        }
    }
    
    // Opción 3: Fallback a duración actual
    return 0;
}

if($_POST){
    // Procesar nuevo archivo de audio si se subió
    $audio_filename = $song->archivo_audio;
    $duracion = $song->duracion; // Mantener duración actual por defecto
    
    if($_FILES['archivo_audio']['error'] === UPLOAD_ERR_OK) {
        $audio_file = $_FILES['archivo_audio'];
        $audio_ext = pathinfo($audio_file['name'], PATHINFO_EXTENSION);
        $audio_filename = uniqid() . '.' . $audio_ext;
        $audio_dest = 'uploads/audio/' . $audio_filename;
        
        if(move_uploaded_file($audio_file['tmp_name'], $audio_dest)) {
            // Obtener duración automáticamente del nuevo archivo
            $nueva_duracion = getAudioDuration($audio_dest);
            
            if($nueva_duracion > 0) {
                $duracion = $nueva_duracion;
                $message .= '<div class="alert alert-info">Nueva duración detectada: ' . gmdate("i:s", $duracion) . '</div>';
            } else {
                $message .= '<div class="alert alert-warning">No se pudo detectar la duración del nuevo archivo. Se mantiene la duración anterior.</div>';
            }
            
            // Eliminar archivo anterior si existe
            if(!empty($song->archivo_audio)) {
                @unlink('uploads/audio/' . $song->archivo_audio);
            }
        } else {
            $message .= '<div class="alert alert-danger">Error al subir el nuevo archivo de audio.</div>';
        }
    }

    // Si se proporcionó duración manual (fallback)
    if(isset($_POST['duracion_manual']) && $_POST['duracion_manual'] > 0) {
        $duracion = $_POST['duracion_manual'];
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
        $message .= '<div class="alert alert-success">Canción actualizada exitosamente.</div>';
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
                                    La duración se detectará automáticamente al subir un nuevo archivo.
                                </small>
                            </div>
                            
                            <!-- Mostrar nueva duración detectada -->
                            <div class="mb-3 alert alert-info" id="nuevaDuracionInfo" style="display: none;">
                                <strong>Nueva duración detectada:</strong> <span id="nuevaDuracionTexto"></span>
                            </div>
                            
                            <!-- Campo de duración manual (como fallback) -->
                            <div class="mb-3" id="duracionManualContainer" style="display: none;">
                                <label class="form-label">Duración Manual (segundos)</label>
                                <input type="number" class="form-control" name="duracion_manual" id="duracion_manual" 
                                       value="<?php echo $song->duracion; ?>" min="1">
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
                            
                            <input type="hidden" name="duracion" id="duracionHidden" value="<?php echo $song->duracion; ?>">
                            
                            <button type="submit" class="btn" style="background: #1db954; color: white;" id="submitBtn">Actualizar Canción</button>
                            <a href="songs.php" class="btn btn-secondary">Volver</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
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
                    } else {
                        nuevaDuracionInfo.style.display = 'none';
                        // Mostrar campo manual como fallback
                        duracionManualContainer.style.display = 'block';
                        alert('No se pudo detectar la duración automáticamente. Por favor, ingresa la duración manualmente.');
                    }
                    
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Actualizar Canción';
                };
                
                audio.onerror = function() {
                    nuevaDuracionInfo.style.display = 'none';
                    duracionManualContainer.style.display = 'block';
                    alert('Error al cargar el archivo de audio. Por favor, verifica que el archivo sea válido o ingresa la duración manualmente.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Actualizar Canción';
                };
                
                audio.src = URL.createObjectURL(file);
            } else {
                // Si no se selecciona archivo, ocultar los mensajes
                nuevaDuracionInfo.style.display = 'none';
                duracionManualContainer.style.display = 'none';
            }
        });
        
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
        }
        
        // Mostrar/ocultar campo manual basado en si hay archivo seleccionado
        document.getElementById('songForm').addEventListener('reset', function() {
            document.getElementById('nuevaDuracionInfo').style.display = 'none';
            document.getElementById('duracionManualContainer').style.display = 'none';
        });
    </script>
</body>
</html>