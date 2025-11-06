<?php
class Album {
    private $conn;
    private $table_name = "album";

    public $id_album;
    public $titulo;
    public $id_artista;
    public $fecha_lanzamiento;
    public $portada;
    public $genero;
    public $nombre_artista;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear nuevo álbum
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET titulo=:titulo, id_artista=:id_artista, 
                    fecha_lanzamiento=:fecha_lanzamiento, portada=:portada, 
                    genero=:genero";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->portada = htmlspecialchars(strip_tags($this->portada));
        $this->genero = htmlspecialchars(strip_tags($this->genero));

        // Bind parameters
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":id_artista", $this->id_artista);
        $stmt->bindParam(":fecha_lanzamiento", $this->fecha_lanzamiento);
        $stmt->bindParam(":portada", $this->portada);
        $stmt->bindParam(":genero", $this->genero);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Leer todos los álbumes
    public function read() {
        $query = "SELECT 
                    a.id_album, a.titulo, a.fecha_lanzamiento, a.portada, a.genero,
                    ar.nombre_artista, 
                    COUNT(c.id_cancion) as total_canciones
                FROM " . $this->table_name . " a
                LEFT JOIN artista ar ON a.id_artista = ar.id_artista
                LEFT JOIN cancion c ON a.id_album = c.id_album
                GROUP BY a.id_album
                ORDER BY a.fecha_lanzamiento DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Leer un álbum por ID
    public function readOne() {
        $query = "SELECT 
                    a.id_album, a.titulo, a.id_artista, a.fecha_lanzamiento, 
                    a.portada, a.genero, ar.nombre_artista
                FROM " . $this->table_name . " a
                LEFT JOIN artista ar ON a.id_artista = ar.id_artista
                WHERE a.id_album = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_album);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->titulo = $row['titulo'];
            $this->id_artista = $row['id_artista'];
            $this->fecha_lanzamiento = $row['fecha_lanzamiento'];
            $this->portada = $row['portada'];
            $this->genero = $row['genero'];
            $this->nombre_artista = $row['nombre_artista'];
            
            return true;
        }
        
        return false;
    }

    // Actualizar álbum
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET titulo=:titulo, id_artista=:id_artista, 
                    fecha_lanzamiento=:fecha_lanzamiento, portada=:portada, 
                    genero=:genero
                WHERE id_album = :id_album";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->portada = htmlspecialchars(strip_tags($this->portada));
        $this->genero = htmlspecialchars(strip_tags($this->genero));

        // Bind parameters
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":id_artista", $this->id_artista);
        $stmt->bindParam(":fecha_lanzamiento", $this->fecha_lanzamiento);
        $stmt->bindParam(":portada", $this->portada);
        $stmt->bindParam(":genero", $this->genero);
        $stmt->bindParam(":id_album", $this->id_album);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar álbum
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id_album = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_album);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Buscar álbumes
    public function search($keywords) {
        $query = "SELECT 
                    a.id_album, a.titulo, a.fecha_lanzamiento, a.portada, a.genero,
                    ar.nombre_artista,
                    COUNT(c.id_cancion) as total_canciones
                FROM " . $this->table_name . " a
                LEFT JOIN artista ar ON a.id_artista = ar.id_artista
                LEFT JOIN cancion c ON a.id_album = c.id_album
                WHERE a.titulo LIKE ? OR ar.nombre_artista LIKE ? OR a.genero LIKE ?
                GROUP BY a.id_album
                ORDER BY a.fecha_lanzamiento DESC";

        $stmt = $this->conn->prepare($query);

        $keywords = "%{$keywords}%";
        $stmt->bindParam(1, $keywords);
        $stmt->bindParam(2, $keywords);
        $stmt->bindParam(3, $keywords);

        $stmt->execute();
        return $stmt;
    }

    // Obtener canciones del álbum
    public function getCanciones() {
        $query = "SELECT 
                    c.id_cancion, c.titulo, c.duracion, c.popularidad,
                    c.archivo_audio, c.explicit
                FROM cancion c
                WHERE c.id_album = ?
                ORDER BY c.titulo";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_album);
        $stmt->execute();

        return $stmt;
    }
}
?>