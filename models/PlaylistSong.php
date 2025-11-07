<?php
class PlaylistSong {
    private $conn;
    private $table_name = "playlist_cancion";

    public $id_playlist;
    public $id_cancion;
    public $orden;
    public $fecha_agregado;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Agregar canción a playlist
    public function addSong() {
        // Verificar si la canción ya está en la playlist
        $check_query = "SELECT id_playlist FROM " . $this->table_name . " 
                       WHERE id_playlist = ? AND id_cancion = ?";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $this->id_playlist);
        $check_stmt->bindParam(2, $this->id_cancion);
        $check_stmt->execute();

        if($check_stmt->rowCount() > 0) {
            return false; // Canción ya existe en la playlist
        }

        // Obtener el siguiente orden
        $order_query = "SELECT COALESCE(MAX(orden), 0) + 1 as next_order 
                       FROM " . $this->table_name . " 
                       WHERE id_playlist = ?";
        $order_stmt = $this->conn->prepare($order_query);
        $order_stmt->bindParam(1, $this->id_playlist);
        $order_stmt->execute();
        $row = $order_stmt->fetch(PDO::FETCH_ASSOC);
        $this->orden = $row['next_order'];

        // Insertar canción
        $query = "INSERT INTO " . $this->table_name . " 
                 SET id_playlist=:id_playlist, id_cancion=:id_cancion, orden=:orden";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id_playlist", $this->id_playlist);
        $stmt->bindParam(":id_cancion", $this->id_cancion);
        $stmt->bindParam(":orden", $this->orden);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Remover canción de playlist
    public function removeSong() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id_playlist = ? AND id_cancion = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_playlist);
        $stmt->bindParam(2, $this->id_cancion);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Obtener canciones de una playlist
    public function getSongs() {
        $query = "SELECT c.*, a.nombre_artista, al.titulo as titulo_album, 
                         pc.orden, pc.fecha_agregado 
                  FROM " . $this->table_name . " pc
                  INNER JOIN cancion c ON pc.id_cancion = c.id_cancion
                  INNER JOIN artista a ON c.id_artista = a.id_artista
                  LEFT JOIN album al ON c.id_album = al.id_album
                  WHERE pc.id_playlist = ?
                  ORDER BY pc.orden";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_playlist);
        $stmt->execute();
        return $stmt;
    }

    // Reordenar canciones en playlist
    public function reorderSongs($songOrders) {
        try {
            $this->conn->beginTransaction();

            $query = "UPDATE " . $this->table_name . " 
                     SET orden = :orden 
                     WHERE id_playlist = :id_playlist AND id_cancion = :id_cancion";
            $stmt = $this->conn->prepare($query);

            foreach($songOrders as $order) {
                $stmt->bindParam(":orden", $order['orden']);
                $stmt->bindParam(":id_playlist", $this->id_playlist);
                $stmt->bindParam(":id_cancion", $order['id_cancion']);
                $stmt->execute();
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
}
?>