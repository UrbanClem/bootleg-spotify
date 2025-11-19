<?php
include 'config/session.php';

// Iniciar sesión antes de destruirla
Session::init();

// Limpiar todas las variables de sesión
$_SESSION = array();

// Destruir la sesión
if (session_status() === PHP_SESSION_ACTIVE) {
    session_destroy();
}

// Redirigir al login
header("Location: login.php");
exit();
?>