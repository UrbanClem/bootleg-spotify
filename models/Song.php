<?php
class Song {
    private $conn;
    private $table_name = "cancion";

    public $id_cancion;
    public $titulo;
    public $duracion;
    public $id_artista;
    public $id_album;
    public $popularidad;
    public $fecha_lanzamiento;
    public $archivo_audio;
    public $letra;
    public $explicit;
    public $nombre_artista;
    public $titulo_album;
    public $portada_album; // Nueva propiedad para la portada del álbum

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear nueva canción
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET titulo=:titulo, duracion=:duracion, id_artista=:id_artista, 
                    id_album=:id_album, fecha_lanzamiento=:fecha_lanzamiento, 
                    archivo_audio=:archivo_audio, letra=:letra, explicit=:explicit";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->duracion = htmlspecialchars(strip_tags($this->duracion));
        $this->archivo_audio = htmlspecialchars(strip_tags($this->archivo_audio));

        // Bind parameters
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":duracion", $this->duracion);
        $stmt->bindParam(":id_artista", $this->id_artista);
        $stmt->bindParam(":id_album", $this->id_album);
        $stmt->bindParam(":fecha_lanzamiento", $this->fecha_lanzamiento);
        $stmt->bindParam(":archivo_audio", $this->archivo_audio);
        $stmt->bindParam(":letra", $this->letra);
        $stmt->bindParam(":explicit", $this->explicit);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Leer todas las canciones
    public function read() {
        $query = "SELECT 
                    c.id_cancion, c.titulo, c.duracion, c.popularidad,
                    c.fecha_lanzamiento, c.archivo_audio, c.explicit,
                    a.nombre_artista, al.titulo as titulo_album, al.portada as portada_album
                FROM " . $this->table_name . " c
                LEFT JOIN artista a ON c.id_artista = a.id_artista
                LEFT JOIN album al ON c.id_album = al.id_album
                ORDER BY c.popularidad DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Leer una canción por ID
    public function readOne() {
        $query = "SELECT 
                    c.id_cancion, c.titulo, c.duracion, c.popularidad,
                    c.fecha_lanzamiento, c.archivo_audio, c.letra, c.explicit,
                    c.id_artista, c.id_album,
                    a.nombre_artista, al.titulo as titulo_album, al.portada as portada_album
                FROM " . $this->table_name . " c
                LEFT JOIN artista a ON c.id_artista = a.id_artista
                LEFT JOIN album al ON c.id_album = al.id_album
                WHERE c.id_cancion = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_cancion);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->titulo = $row['titulo'];
            $this->duracion = $row['duracion'];
            $this->popularidad = $row['popularidad'];
            $this->fecha_lanzamiento = $row['fecha_lanzamiento'];
            $this->archivo_audio = $row['archivo_audio'];
            $this->letra = $row['letra'];
            $this->explicit = $row['explicit'];
            $this->id_artista = $row['id_artista'];
            $this->id_album = $row['id_album'];
            $this->nombre_artista = $row['nombre_artista'];
            $this->titulo_album = $row['titulo_album'];
            $this->portada_album = $row['portada_album'];
            
            return true;
        }
        
        return false;
    }

    // Actualizar canción
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET titulo=:titulo, duracion=:duracion, id_artista=:id_artista, 
                    id_album=:id_album, fecha_lanzamiento=:fecha_lanzamiento, 
                    archivo_audio=:archivo_audio, letra=:letra, explicit=:explicit
                WHERE id_cancion = :id_cancion";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->duracion = htmlspecialchars(strip_tags($this->duracion));
        $this->archivo_audio = htmlspecialchars(strip_tags($this->archivo_audio));

        // Bind parameters
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":duracion", $this->duracion);
        $stmt->bindParam(":id_artista", $this->id_artista);
        $stmt->bindParam(":id_album", $this->id_album);
        $stmt->bindParam(":fecha_lanzamiento", $this->fecha_lanzamiento);
        $stmt->bindParam(":archivo_audio", $this->archivo_audio);
        $stmt->bindParam(":letra", $this->letra);
        $stmt->bindParam(":explicit", $this->explicit);
        $stmt->bindParam(":id_cancion", $this->id_cancion);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar canción
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id_cancion = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_cancion);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Buscar canciones
    public function search($keywords) {
        $query = "SELECT 
                    c.id_cancion, c.titulo, c.duracion, c.popularidad,
                    c.fecha_lanzamiento, c.archivo_audio, c.explicit,
                    a.nombre_artista, al.titulo as titulo_album, al.portada as portada_album
                FROM " . $this->table_name . " c
                LEFT JOIN artista a ON c.id_artista = a.id_artista
                LEFT JOIN album al ON c.id_album = al.id_album
                WHERE c.titulo LIKE ? OR a.nombre_artista LIKE ?
                ORDER BY c.popularidad DESC";

        $stmt = $this->conn->prepare($query);

        $keywords = "%{$keywords}%";
        $stmt->bindParam(1, $keywords);
        $stmt->bindParam(2, $keywords);

        $stmt->execute();
        return $stmt;
    }
}
?>