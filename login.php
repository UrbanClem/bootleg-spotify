<?php
include 'config/database.php';
include 'models/User.php';
include 'config/session.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$message = '';

if($_POST){
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // Validaciones básicas
    if(empty($email) || empty($password)) {
        $message = '<div class="alert alert-danger">Por favor, complete todos los campos.</div>';
    } else {
        $user->email = $email;
        
        if($user->emailExists()){
            // Verificar contraseña
            if($user->verifyPassword($password)) {
                Session::init();
                Session::set('user_logged_in', true);
                Session::set('user_id', $user->id_usuario);
                Session::set('user_name', $user->nombre);
                Session::set('user_email', $user->email);
                Session::set('user_type', $user->tipo_cuenta);
                
                // Actualizar última conexión
                $user->updateLastConnection();
                
                header("Location: dashboard.php");
                exit();
            } else {
                $message = '<div class="alert alert-danger">Contraseña incorrecta.</div>';
            }
        } else {
            $message = '<div class="alert alert-danger">Email no registrado.</div>';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Spotify Clone</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #1db954, #191414);
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        .login-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
            max-width: 400px;
            width: 100%;
        }
        .login-header {
            background: #191414;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .login-form {
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
        .register-link {
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="login-container">
                    <div class="login-header">
                        <h2>Iniciar Sesión</h2>
                        <p class="mb-0">Bienvenido de vuelta</p>
                    </div>
                    <div class="login-form">
                        <?php echo $message; ?>
                        <form method="POST" id="loginForm">
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" name="email" 
                                       value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>" 
                                       required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="password" name="password" required>
                            </div>
                            <button type="submit" class="btn btn-spotify w-100">Iniciar Sesión</button>
                        </form>
                        <div class="register-link">
                            <p>¿No tienes cuenta? <a href="register.php">Regístrate aquí</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Validación básica del formulario
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if(!email || !password) {
                e.preventDefault();
                alert('Por favor, complete todos los campos.');
                return false;
            }
            
            // Validación básica de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email)) {
                e.preventDefault();
                alert('Por favor, ingrese un email válido.');
                return false;
            }
        });
    </script>
</body>
</html>