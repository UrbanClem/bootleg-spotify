<?php
include 'config/database.php';
include 'models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$message = '';

if($_POST){
    $user->nombre = $_POST['nombre'];
    $user->email = $_POST['email'];
    $user->fecha_nacimiento = $_POST['fecha_nacimiento'];
    $user->pais = $_POST['pais'];

    // Verificar si el email ya existe
    if($user->emailExists()){
        $message = '<div class="alert alert-danger">El email ya está registrado.</div>';
    } else {
        // Crear el usuario
        if($user->create()){
            $message = '<div class="alert alert-success">Registro exitoso. Ahora puedes iniciar sesión.</div>';
        } else {
            $message = '<div class="alert alert-danger">Error en el registro.</div>';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #1db954, #191414);
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        .register-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
            max-width: 400px;
            width: 100%;
        }
        .register-header {
            background: #191414;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .register-form {
            padding: 30px;
        }
        .btn-spotify {
            background: #1db954;
            border: none;
            color: white;
            padding: 12px;
            font-weight: bold;
        }
        .btn-spotify:hover {
            background: #1ed760;
        }
        .login-link {
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="register-container">
                    <div class="register-header">
                        <h2>Crear Cuenta</h2>
                        <p class="mb-0">Únete a MusicStream</p>
                    </div>
                    <div class="register-form">
                        <?php echo $message; ?>
                        <form method="POST">
                            <div class="mb-3">
                                <label for="nombre" class="form-label">Nombre Completo</label>
                                <input type="text" class="form-control" id="nombre" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label for="fecha_nacimiento" class="form-label">Fecha de Nacimiento</label>
                                <input type="date" class="form-control" id="fecha_nacimiento" name="fecha_nacimiento" required>
                            </div>
                            <div class="mb-3">
                                <label for="pais" class="form-label">País</label>
                                <select class="form-control" id="pais" name="pais" required>
                                    <option value="">Selecciona tu país</option>
                                    <option value="México">México</option>
                                    <option value="España">España</option>
                                    <option value="Argentina">Argentina</option>
                                    <option value="Colombia">Colombia</option>
                                    <option value="Chile">Chile</option>
                                    <option value="Estados Unidos">Estados Unidos</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-spotify w-100">Registrarse</button>
                        </form>
                        <div class="login-link">
                            <p>¿Ya tienes cuenta? <a href="login.php">Inicia sesión</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>