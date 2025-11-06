<?php
include 'config/session.php';
include 'config/database.php';
include 'models/Song.php';

Session::checkLogin();

$database = new Database();
$db = $database->getConnection();
$song = new Song($db);

$search_term = isset($_GET['search']) ? $_GET['search'] : '';

if(!empty($search_term)) {
    $stmt = $song->search($search_term);
} else {
    $stmt = $song->read();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buscar Canciones - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body style="background: #191414; color: white; min-height: 100vh;">
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>🔍 Resultados de Búsqueda</h2>
            <a href="songs.php" class="btn btn-secondary">← Volver</a>
        </div>

        <?php if(!empty($search_term)): ?>
            <p class="mb-4">Búsqueda: "<strong><?php echo htmlspecialchars($search_term); ?></strong>"</p>
        <?php endif; ?>

        <div class="row">
            <?php if($stmt->rowCount() > 0): ?>
                <?php while ($row = $stmt->fetch(PDO::FETCH_ASSOC)): ?>
                    <div class="col-md-4 mb-4">
                        <div class="card" style="background: #282828; border: none;">
                            <div class="card-body">
                                <h5 class="card-title"><?php echo $row['titulo']; ?></h5>
                                <p class="card-text">
                                    <strong>Artista:</strong> <?php echo $row['nombre_artista']; ?><br>
                                    <strong>Álbum:</strong> <?php echo $row['titulo_album'] ?: 'Single'; ?><br>
                                    <strong>Duración:</strong> <?php echo gmdate("i:s", $row['duracion']); ?>
                                </p>
                                <div class="btn-group">
                                    <a href="edit_song.php?id=<?php echo $row['id_cancion']; ?>" class="btn btn-sm btn-warning">Editar</a>
                                    <a href="delete_song.php?id=<?php echo $row['id_cancion']; ?>" class="btn btn-sm btn-danger" onclick="return confirm('¿Estás seguro?')">Eliminar</a>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <div class="col-12">
                    <div class="alert alert-warning text-center">
                        No se encontraron canciones que coincidan con tu búsqueda.
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>