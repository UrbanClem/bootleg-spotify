<?php
session_start();

class Session {
    public static function init() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function set($key, $value) {
        $_SESSION[$key] = $value;
    }

    public static function get($key) {
        return isset($_SESSION[$key]) ? $_SESSION[$key] : null;
    }

    public static function destroy() {
        session_destroy();
        header("Location: login.php");
        exit();
    }

    public static function checkLogin() {
        self::init();
        if (!self::get('user_logged_in')) {
            self::destroy();
        }
    }

    public static function isLoggedIn() {
        self::init();
        return self::get('user_logged_in') === true;
    }
}
?>