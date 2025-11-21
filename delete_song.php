<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Song.php';

Session::checkLogin();

$database = new Database();
$db = $database->getConnection();
$song = new Song($db);

// Obtener el ID de la canción
$song->id_cancion = isset($_GET['id']) ? $_GET['id'] : die('ERROR: ID de canción no especificado.');

// Leer los datos de la canción para mostrar información
$song->readOne();

// Eliminar archivos físicos
if(!empty($song->archivo_audio)) {
    @unlink('uploads/audio/' . $song->archivo_audio);
}

if($_POST){
    if($song->delete()){
        header("Location: songs.php?message=deleted");
        exit();
    } else {
        echo "<script>alert('Error al eliminar la canción');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eliminar Canción - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-6 mx-auto">
                <div class="card" style="background: #282828; border: none;">
                    <div class="card-header" style="background: #dc3545; color: white;">
                        <h4>Eliminar Canción</h4>
                    </div>
                    <div class="card-body">
                        <p>¿Estás seguro de que quieres eliminar la siguiente canción?</p>
                        
                        <div class="alert alert-warning">
                            <strong>Título:</strong> <?php echo $song->titulo; ?><br>
                            <strong>Artista:</strong> <?php echo $song->nombre_artista; ?><br>
                            <strong>Álbum:</strong> <?php echo $song->titulo_album ?: 'Single'; ?>
                        </div>

                        <form method="POST">
                            <button type="submit" class="btn btn-danger">Sí, eliminar</button>
                            <a href="songs.php" class="btn btn-secondary">Cancelar</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</body>
</html>