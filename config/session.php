<?php
class Session {
    public static function init() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function set($key, $value) {
        self::init(); // Asegurar que la sesión esté iniciada
        $_SESSION[$key] = $value;
    }

    public static function get($key) {
        self::init(); // Asegurar que la sesión esté iniciada
        return $_SESSION[$key] ?? null;
    }

    public static function destroy() {
        // Solo destruir si la sesión está activa
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
            $_SESSION = array();
        }
    }

    public static function isLoggedIn() {
        self::init(); // Asegurar que la sesión esté iniciada
        return isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true;
    }

    // Verificar si el usuario es Admin
    public static function isAdmin() {
        self::init(); // Asegurar que la sesión esté iniciada
        return self::isLoggedIn() && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'Admin';
    }

    // Verificar permisos de administrador
    public static function requireAdmin() {
        if (!self::isAdmin()) {
            header("Location: dashboard.php");
            exit();
        }
    }

    // Verificar si el usuario es Premium
    public static function isPremium() {
        self::init(); // Asegurar que la sesión esté iniciada
        return self::isLoggedIn() && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'Premium';
    }
}
?>