<?php
include 'config/session.php';
include 'config/database.php';
include 'models/User.php';

Session::checkLogin();

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Obtener información del usuario actual
$user->id_usuario = Session::get('user_id');
$user->readOne();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: #191414;
            color: white;
            min-height: 100vh;
        }
        .sidebar {
            background: #000000;
            min-height: 100vh;
            padding: 20px;
        }
        .main-content {
            padding: 20px;
        }
        .nav-link {
            color: #b3b3b3;
            margin: 10px 0;
        }
        .nav-link:hover {
            color: white;
        }
        .nav-link.active {
            color: white;
            font-weight: bold;
        }
        .card-spotify {
            background: #282828;
            border: none;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .btn-spotify {
            background: #1db954;
            border: none;
            color: white;
        }
        .btn-spotify:hover {
            background: #1ed760;
        }
        .user-info {
            background: linear-gradient(135deg, #1db954, #191414);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-md-2 sidebar">
                <div class="d-flex flex-column">
                    <h4 class="mb-4">MusicStream</h4>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="dashboard.php">Inicio</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="profile.php">Mi Perfil</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="users.php">Gestión de Usuarios</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="logout.php">Cerrar Sesión</a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Main Content -->
            <div class="col-md-10 main-content">
                <div class="row">
                    <div class="col-12">
                        <div class="user-info">
                            <h2>Bienvenido, <?php echo Session::get('user_name'); ?>!</h2>
                            <p class="mb-0">Tipo de cuenta: <?php echo $user->tipo_cuenta; ?></p>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="card card-spotify">
                            <div class="card-body">
                                <h5 class="card-title">Mis Playlists</h5>
                                <p class="card-text">Gestiona tus listas de reproducción</p>
                                <a href="playlists.php" class="btn btn-spotify">Ver Playlists</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card card-spotify">
                            <div class="card-body">
                                <h5 class="card-title">Artistas Seguidos</h5>
                                <p class="card-text">Tus artistas favoritos</p>
                                <a href="#" class="btn btn-spotify">Ver Artistas</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card card-spotify">
                            <div class="card-body">
                                <h5 class="card-title">Historial</h5>
                                <p class="card-text">Tu actividad reciente</p>
                                <a href="#" class="btn btn-spotify">Ver Historial</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nueva fila para los cards de gestión -->
                <div class="row">
                    <div class="col-md-4">
                        <div class="card card-spotify">
                            <div class="card-body">
                                <h5 class="card-title">Gestión de Canciones</h5>
                                <p class="card-text">Agregar y administrar canciones</p>
                                <a href="songs.php" class="btn btn-spotify">Gestionar Canciones</a>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card card-spotify">
                            <div class="card-body">
                                <h5 class="card-title">Gestión de Álbumes</h5>
                                <p class="card-text">Administrar álbumes y sus portadas</p>
                                <a href="albums.php" class="btn btn-spotify">Gestionar Álbumes</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card card-spotify">
                            <div class="card-body">
                                <h5 class="card-title">Información de tu Cuenta</h5>
                                <table class="table table-dark">
                                    <tr>
                                        <th>Nombre:</th>
                                        <td><?php echo $user->nombre; ?></td>
                                    </tr>
                                    <tr>
                                        <th>Email:</th>
                                        <td><?php echo $user->email; ?></td>
                                    </tr>
                                    <tr>
                                        <th>Fecha de Registro:</th>
                                        <td><?php echo $user->fecha_registro; ?></td>
                                    </tr>
                                    <tr>
                                        <th>País:</th>
                                        <td><?php echo $user->pais; ?></td>
                                    </tr>
                                    <tr>
                                        <th>Saldo:</th>
                                        <td>$<?php echo number_format($user->saldo, 2); ?></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>