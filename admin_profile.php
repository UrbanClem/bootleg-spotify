<?php
include 'config/session.php';
include 'config/database.php';
include 'models/User.php';

Session::init();

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$user->id_usuario = Session::get('user_id');
$user->readOne();

$message = '';

if($_POST){
    $user->nombre = $_POST['nombre'];
    $user->email = $_POST['email'];
    $user->fecha_nacimiento = $_POST['fecha_nacimiento'];
    $user->pais = $_POST['pais'];

    if($user->update()){
        Session::set('user_name', $user->nombre);
        $message = '<div class="alert alert-success">Perfil actualizado exitosamente.</div>';
    } else {
        $message = '<div class="alert alert-danger">Error al actualizar perfil.</div>';
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Perfil - Spotify Clone</title>
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
        .profile-header {
            background: linear-gradient(135deg, #1db954, #191414);
            border-radius: 10px;
            padding: 30px;
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
                            <a class="nav-link" href="dashboard.php">Inicio</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="profile.php">Mi Perfil</a>
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
                <div class="profile-header">
                    <h2>Mi Perfil</h2>
                    <p class="mb-0">Gestiona tu información personal</p>
                </div>

                <?php echo $message; ?>

                <div class="row">
                    <div class="col-md-8">
                        <div class="card card-spotify">
                            <div class="card-body">
                                <h5 class="card-title">Información Personal</h5>
                                <form method="POST">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Nombre Completo</label>
                                            <input type="text" class="form-control" name="nombre" value="<?php echo $user->nombre; ?>" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Email</label>
                                            <input type="email" class="form-control" name="email" value="<?php echo $user->email; ?>" required>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Fecha de Nacimiento</label>
                                            <input type="date" class="form-control" name="fecha_nacimiento" value="<?php echo $user->fecha_nacimiento; ?>" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">País</label>
                                            <select class="form-control" name="pais" required>
                                                <option value="México" <?php echo $user->pais == 'México' ? 'selected' : ''; ?>>México</option>
                                                <option value="España" <?php echo $user->pais == 'España' ? 'selected' : ''; ?>>España</option>
                                                <option value="Argentina" <?php echo $user->pais == 'Argentina' ? 'selected' : ''; ?>>Argentina</option>
                                                <option value="Colombia" <?php echo $user->pais == 'Colombia' ? 'selected' : ''; ?>>Colombia</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-spotify">Actualizar Perfil</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card card-spotify">
                            <div class="card-body">
                                <h5 class="card-title">Información de la Cuenta</h5>
                                <div class="mb-3">
                                    <strong>Tipo de Cuenta:</strong><br>
                                    <span class="badge bg-<?php echo $user->tipo_cuenta == 'Premium' ? 'success' : 'secondary'; ?>">
                                        <?php echo $user->tipo_cuenta; ?>
                                    </span>
                                </div>
                                <div class="mb-3">
                                    <strong>Fecha de Registro:</strong><br>
                                    <?php echo $user->fecha_registro; ?>
                                </div>
                                <div class="mb-3">
                                    <strong>Saldo Actual:</strong><br>
                                    $<?php echo number_format($user->saldo, 2); ?>
                                </div>
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