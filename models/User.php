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

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear usuario (Registro)
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET nombre=:nombre, email=:email, fecha_registro=CURDATE(), 
                     tipo_cuenta='Free', saldo=0.00, fecha_nacimiento=:fecha_nacimiento, 
                     pais=:pais";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->fecha_nacimiento = htmlspecialchars(strip_tags($this->fecha_nacimiento));
        $this->pais = htmlspecialchars(strip_tags($this->pais));

        // Bind parameters
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":fecha_nacimiento", $this->fecha_nacimiento);
        $stmt->bindParam(":pais", $this->pais);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Verificar si email existe
    public function emailExists() {
        $query = "SELECT id_usuario, nombre, email, tipo_cuenta, fecha_registro 
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
            $this->tipo_cuenta = $row['tipo_cuenta'];
            $this->fecha_registro = $row['fecha_registro'];
            return true;
        }
        return false;
    }

    // Leer todos los usuarios (para administración)
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY fecha_registro DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Leer un usuario específico
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
            return true;
        }
        return false;
    }

    // Actualizar usuario
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                 SET nombre=:nombre, email=:email, tipo_cuenta=:tipo_cuenta, 
                     saldo=:saldo, fecha_nacimiento=:fecha_nacimiento, pais=:pais 
                 WHERE id_usuario=:id_usuario";

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