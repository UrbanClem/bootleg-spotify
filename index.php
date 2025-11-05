<?php
// Redirigir al dashboard si ya está logueado, sino al login
include 'config/session.php';

if(Session::isLoggedIn()) {
    header("Location: dashboard.php");
} else {
    header("Location: login.php");
}
exit();
?>