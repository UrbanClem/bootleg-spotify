<?php
class User {
    private $conn;
    private $table_name = "usuario";

    public $id_usuario;
    public $nombre;
    public $email;
    public $fecha_registro;
    public $tipo_cuenta;
    public $saldo;
    public $fecha_nacimiento;
    public $pais;
    public $password;
    public $password_hash; // Nueva propiedad para el hash de contraseña
    public $ultima_conexion; // Nueva propiedad para última conexión

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET nombre=:nombre, email=:email, password_hash=:password_hash,
                    fecha_registro=CURDATE(), tipo_cuenta='Free', saldo=0.00, 
                    fecha_nacimiento=:fecha_nacimiento, pais=:pais";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->fecha_nacimiento = '1990-01-01'; // Valor por defecto
        $this->pais = 'Desconocido'; // Valor por defecto

        // Hash de la contraseña
        $password_hash = password_hash($this->password, PASSWORD_DEFAULT);

        // Bind parameters
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password_hash", $password_hash);
        $stmt->bindParam(":fecha_nacimiento", $this->fecha_nacimiento);
        $stmt->bindParam(":pais", $this->pais);

        if($stmt->execute()) {
            $this->id_usuario = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Verificar si email existe - ACTUALIZADO
    public function emailExists() {
        $query = "SELECT id_usuario, nombre, email, password_hash, tipo_cuenta, 
                         fecha_registro, ultima_conexion 
                  FROM " . $this->table_name . " 
                  WHERE email = ? 
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id_usuario = $row['id_usuario'];
            $this->nombre = $row['nombre'];
            $this->email = $row['email'];
            $this->password_hash = $row['password_hash'];
            $this->tipo_cuenta = $row['tipo_cuenta'];
            $this->fecha_registro = $row['fecha_registro'];
            $this->ultima_conexion = $row['ultima_conexion'];
            return true;
        }
        return false;
    }

    // NUEVO MÉTODO: Verificar contraseña
    public function verifyPassword($password) {
        if (password_verify($password, $this->password_hash)) {
            return true;
        }
        return false;
    }

    // NUEVO MÉTODO: Actualizar última conexión
    public function updateLastConnection() {
        $query = "UPDATE " . $this->table_name . " 
                  SET ultima_conexion = NOW() 
                  WHERE id_usuario = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_usuario);
        
        return $stmt->execute();
    }

    // Leer todos los usuarios (para administración)
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY fecha_registro DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Leer un usuario específico - ACTUALIZADO
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id_usuario = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_usuario);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->nombre = $row['nombre'];
            $this->email = $row['email'];
            $this->fecha_registro = $row['fecha_registro'];
            $this->tipo_cuenta = $row['tipo_cuenta'];
            $this->saldo = $row['saldo'];
            $this->fecha_nacimiento = $row['fecha_nacimiento'];
            $this->pais = $row['pais'];
            $this->password_hash = $row['password_hash'];
            $this->ultima_conexion = $row['ultima_conexion'];
            return true;
        }
        return false;
    }

    // Actualizar usuario - ACTUALIZADO (opcional: para actualizar contraseña)
    public function update() {
        // Si se proporciona una nueva contraseña, incluirla en la actualización
        if (!empty($this->password)) {
            $query = "UPDATE " . $this->table_name . " 
                     SET nombre=:nombre, email=:email, tipo_cuenta=:tipo_cuenta, 
                         saldo=:saldo, fecha_nacimiento=:fecha_nacimiento, pais=:pais,
                         password_hash=:password_hash
                     WHERE id_usuario=:id_usuario";
        } else {
            $query = "UPDATE " . $this->table_name . " 
                     SET nombre=:nombre, email=:email, tipo_cuenta=:tipo_cuenta, 
                         saldo=:saldo, fecha_nacimiento=:fecha_nacimiento, pais=:pais
                     WHERE id_usuario=:id_usuario";
        }

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->tipo_cuenta = htmlspecialchars(strip_tags($this->tipo_cuenta));
        $this->saldo = htmlspecialchars(strip_tags($this->saldo));
        $this->fecha_nacimiento = htmlspecialchars(strip_tags($this->fecha_nacimiento));
        $this->pais = htmlspecialchars(strip_tags($this->pais));
        $this->id_usuario = htmlspecialchars(strip_tags($this->id_usuario));

        // Bind parameters
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":tipo_cuenta", $this->tipo_cuenta);
        $stmt->bindParam(":saldo", $this->saldo);
        $stmt->bindParam(":fecha_nacimiento", $this->fecha_nacimiento);
        $stmt->bindParam(":pais", $this->pais);
        $stmt->bindParam(":id_usuario", $this->id_usuario);

        // Si hay nueva contraseña, hashearla y bindear
        if (!empty($this->password)) {
            $password_hash = password_hash($this->password, PASSWORD_DEFAULT);
            $stmt->bindParam(":password_hash", $password_hash);
        }

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar usuario
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id_usuario = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_usuario);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Buscar usuarios
    public function search($keywords) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE nombre LIKE ? OR email LIKE ? 
                  ORDER BY fecha_registro DESC";

        $stmt = $this->conn->prepare($query);

        $keywords = htmlspecialchars(strip_tags($keywords));
        $keywords = "%{$keywords}%";

        $stmt->bindParam(1, $keywords);
        $stmt->bindParam(2, $keywords);

        $stmt->execute();
        return $stmt;
    }
}
?>