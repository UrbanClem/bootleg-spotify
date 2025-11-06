<?php
class Artist {
    private $conn;
    private $table_name = "artista";

    public $id_artista;
    public $nombre_artista;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT id_artista, nombre_artista FROM " . $this->table_name . " ORDER BY nombre_artista";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Devuelve array en lugar de statement
    }
}
?>