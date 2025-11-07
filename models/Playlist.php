<?php
class Playlist {
    private $conn;
    private $table_name = "playlist";

    public $id_playlist;
    public $nombre_playlist;
    public $id_usuario;
    public $descripcion;
    public $fecha_creacion;
    public $privada;
    public $portada;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear playlist
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET nombre_playlist=:nombre_playlist, id_usuario=:id_usuario, 
                     descripcion=:descripcion, privada=:privada";

        $stmt = $this->conn->prepare($query);

        $this->nombre_playlist = htmlspecialchars(strip_tags($this->nombre_playlist));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));

        $stmt->bindParam(":nombre_playlist", $this->nombre_playlist);
        $stmt->bindParam(":id_usuario", $this->id_usuario);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":privada", $this->privada);

        if($stmt->execute()) {
            $this->id_playlist = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Leer playlists de un usuario
    public function readByUser() {
        $query = "SELECT p.*, COUNT(pc.id_cancion) as total_canciones 
                  FROM " . $this->table_name . " p 
                  LEFT JOIN playlist_cancion pc ON p.id_playlist = pc.id_playlist 
                  WHERE p.id_usuario = ? 
                  GROUP BY p.id_playlist 
                  ORDER BY p.fecha_creacion DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_usuario);
        $stmt->execute();
        return $stmt;
    }

    // Leer una playlist específica
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE id_playlist = ? AND id_usuario = ? 
                  LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_playlist);
        $stmt->bindParam(2, $this->id_usuario);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->nombre_playlist = $row['nombre_playlist'];
            $this->descripcion = $row['descripcion'];
            $this->fecha_creacion = $row['fecha_creacion'];
            $this->privada = $row['privada'];
            $this->portada = $row['portada'];
            return true;
        }
        return false;
    }

    // Actualizar playlist
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                 SET nombre_playlist=:nombre_playlist, descripcion=:descripcion, 
                     privada=:privada 
                 WHERE id_playlist=:id_playlist AND id_usuario=:id_usuario";

        $stmt = $this->conn->prepare($query);

        $this->nombre_playlist = htmlspecialchars(strip_tags($this->nombre_playlist));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));

        $stmt->bindParam(":nombre_playlist", $this->nombre_playlist);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":privada", $this->privada);
        $stmt->bindParam(":id_playlist", $this->id_playlist);
        $stmt->bindParam(":id_usuario", $this->id_usuario);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar playlist
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id_playlist = ? AND id_usuario = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_playlist);
        $stmt->bindParam(2, $this->id_usuario);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>