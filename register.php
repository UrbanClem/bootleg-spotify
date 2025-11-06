<?php
include 'config/database.php';
include 'models/User.php';
include 'config/session.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$message = '';

if($_POST){
    $user->nombre = $_POST['nombre'];
    $user->email = $_POST['email'];
    $user->password_hash = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    
    // Validaciones
    if(empty($user->nombre) || empty($user->email) || empty($user->password_hash)) {
        $message = '<div class="alert alert-danger">Por favor, complete todos los campos.</div>';
    } elseif($user->password_hash !== $confirm_password) {
        $message = '<div class="alert alert-danger">Las contraseñas no coinciden.</div>';
    } elseif(strlen($user->password_hash) < 6) {
        $message = '<div class="alert alert-danger">La contraseña debe tener al menos 6 caracteres.</div>';
    } else {
        // Verificar si el email ya existe
        if($user->emailExists()) {
            $message = '<div class="alert alert-danger">Este email ya está registrado.</div>';
        } else {
            // Crear usuario
            if($user->create()) {
                $message = '<div class="alert alert-success">Registro exitoso. <a href="login.php">Iniciar sesión</a></div>';
            } else {
                $message = '<div class="alert alert-danger">Error en el registro. Intente nuevamente.</div>';
            }
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
            max-width: 450px;
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
                        <p class="mb-0">Únete a Spotify Clone</p>
                    </div>
                    <div class="register-form">
                        <?php echo $message; ?>
                        <form method="POST" id="registerForm">
                            <div class="mb-3">
                                <label for="nombre" class="form-label">Nombre completo</label>
                                <input type="text" class="form-control" id="nombre" name="nombre" 
                                       value="<?php echo isset($_POST['nombre']) ? htmlspecialchars($_POST['nombre']) : ''; ?>" 
                                       required>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" name="email" 
                                       value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>" 
                                       required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="password" name="password" required>
                                <div class="form-text">Mínimo 6 caracteres</div>
                            </div>
                            <div class="mb-3">
                                <label for="confirm_password" class="form-label">Confirmar Contraseña</label>
                                <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                            </div>
                            <button type="submit" class="btn btn-spotify w-100">Registrarse</button>
                        </form>
                        <div class="login-link">
                            <p>¿Ya tienes cuenta? <a href="login.php">Inicia sesión aquí</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Validación del formulario de registro
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            if(password !== confirmPassword) {
                e.preventDefault();
                alert('Las contraseñas no coinciden.');
                return false;
            }
            
            if(password.length < 6) {
                e.preventDefault();
                alert('La contraseña debe tener al menos 6 caracteres.');
                return false;
            }
        });
    </script>
</body>
</html>