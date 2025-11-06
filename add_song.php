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

$artists = $artist->read();
$albums = $album->read();

$message = '';

// Función para obtener duración del audio
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
    
    // Opción 3: Usar PHP native (para algunos formatos)
    if(function_exists('getid3')) {
        $id3 = getid3();
        $fileInfo = $id3->analyze($file_path);
        if(isset($fileInfo['playtime_seconds'])) {
            return round($fileInfo['playtime_seconds']);
        }
    }
    
    return 0; // Si no se puede determinar la duración
}

if($_POST){
    // Procesar archivo de audio
    $audio_file = $_FILES['archivo_audio'];
    $audio_filename = '';
    $duracion = 0;
    
    if($audio_file['error'] === UPLOAD_ERR_OK) {
        $audio_ext = pathinfo($audio_file['name'], PATHINFO_EXTENSION);
        $audio_filename = uniqid() . '.' . $audio_ext;
        $audio_dest = 'uploads/audio/' . $audio_filename;
        
        if(move_uploaded_file($audio_file['tmp_name'], $audio_dest)) {
            // Obtener duración automáticamente
            $duracion = getAudioDuration($audio_dest);
            
            if($duracion == 0) {
                $message = '<div class="alert alert-warning">No se pudo determinar la duración del audio. Por favor, ingrésala manualmente.</div>';
                // Mostrar campo manual
                $show_manual_duration = true;
            }
        } else {
            $message = '<div class="alert alert-danger">Error al subir el archivo de audio.</div>';
        }
    }

    if(empty($message)) {
        $song->titulo = $_POST['titulo'];
        $song->duracion = $duracion;
        $song->id_artista = $_POST['id_artista'];
        $song->id_album = $_POST['id_album'];
        $song->fecha_lanzamiento = $_POST['fecha_lanzamiento'];
        $song->archivo_audio = $audio_filename;
        $song->letra = $_POST['letra'];
        $song->explicit = isset($_POST['explicit']) ? 1 : 0;

        if($song->create()){
            $message = '<div class="alert alert-success">Canción agregada exitosamente. Duración detectada: ' . gmdate("i:s", $duracion) . '</div>';
        } else {
            $message = '<div class="alert alert-danger">Error al agregar la canción.</div>';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Canción - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="card" style="background: #282828; border: none;">
                    <div class="card-header" style="background: #1db954; color: white;">
                        <h4>Agregar Nueva Canción</h4>
                    </div>
                    <div class="card-body">
                        <?php echo $message; ?>
                        <form method="POST" enctype="multipart/form-data" id="songForm">
                            <div class="mb-3">
                                <label class="form-label">Título *</label>
                                <input type="text" class="form-control" name="titulo" required>
                            </div>
                            
                            <!-- Archivo de Audio -->
                            <div class="mb-3">
                                <label class="form-label">Archivo de Audio *</label>
                                <input type="file" class="form-control" name="archivo_audio" id="archivo_audio" accept=".mp3,.wav,.ogg,.m4a,.flac" required>
                                <small class="form-text text-muted">Formatos aceptados: MP3, WAV, OGG, M4A, FLAC</small>
                            </div>
                            
                            <!-- Campo de duración (oculto por defecto) -->
                            <div class="mb-3" id="duracionManualContainer" style="display: none;">
                                <label class="form-label">Duración (segundos) *</label>
                                <input type="number" class="form-control" name="duracion_manual" id="duracion_manual" min="1">
                                <small class="form-text text-muted">Ingresa la duración manualmente en segundos</small>
                            </div>
                            
                            <!-- Mostrar duración detectada -->
                            <div class="mb-3 alert alert-info" id="duracionInfo" style="display: none;">
                                <strong>Duración detectada:</strong> <span id="duracionTexto"></span>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Artista *</label>
                                <select class="form-control" name="id_artista" required>
                                    <option value="">Seleccionar Artista</option>
                                    <?php foreach ($artists as $artist): ?>
                                        <option value="<?php echo $artist['id_artista']; ?>">
                                            <?php echo $artist['nombre_artista']; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Álbum (Opcional)</label>
                                <select class="form-control" name="id_album">
                                    <option value="">Seleccionar Álbum</option>
                                    <?php foreach ($albums as $album): ?>
                                        <option value="<?php echo $album['id_album']; ?>">
                                            <?php echo $album['titulo']; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                                <small class="form-text text-muted">La imagen de portada se tomará del álbum seleccionado</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Fecha de Lanzamiento</label>
                                <input type="date" class="form-control" name="fecha_lanzamiento">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Letra (Opcional)</label>
                                <textarea class="form-control" name="letra" rows="4"></textarea>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" name="explicit" id="explicit">
                                <label class="form-check-label" for="explicit">Contenido Explícito</label>
                            </div>
                            <button type="submit" class="btn" style="background: #1db954; color: white;">Agregar Canción</button>
                            <a href="songs.php" class="btn btn-secondary">Volver</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Detectar duración del audio usando JavaScript (solo como referencia visual)
        document.getElementById('archivo_audio').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const audio = document.createElement('audio');
                audio.preload = 'metadata';
                
                audio.onloadedmetadata = function() {
                    const duracion = Math.round(audio.duration);
                    document.getElementById('duracionInfo').style.display = 'block';
                    document.getElementById('duracionTexto').textContent = 
                        duracion + ' segundos (' + formatTime(duracion) + ')';
                    
                    // Crear un campo hidden para enviar la duración
                    let hiddenInput = document.getElementById('duracionHidden');
                    if (!hiddenInput) {
                        hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.name = 'duracion';
                        hiddenInput.id = 'duracionHidden';
                        document.getElementById('songForm').appendChild(hiddenInput);
                    }
                    hiddenInput.value = duracion;
                };
                
                audio.src = URL.createObjectURL(file);
            }
        });
        
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
        }
    </script>
</body>
</html>