<?php
class Artist {
    private $conn;
    private $table_name = "artista";

    public $id_artista;
    public $nombre_artista;
    public $verificado;
    public $biografia;
    public $fecha_registro;
    public $reproducciones_totales;
    public $seguidores;
    public $foto_perfil;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear artista
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET nombre_artista=:nombre_artista, verificado=:verificado, 
                     biografia=:biografia, foto_perfil=:foto_perfil, fecha_registro=CURDATE()";

        $stmt = $this->conn->prepare($query);

        $this->nombre_artista = htmlspecialchars(strip_tags($this->nombre_artista));
        $this->biografia = htmlspecialchars(strip_tags($this->biografia));

        $stmt->bindParam(":nombre_artista", $this->nombre_artista);
        $stmt->bindParam(":verificado", $this->verificado);
        $stmt->bindParam(":biografia", $this->biografia);
        $stmt->bindParam(":foto_perfil", $this->foto_perfil);

        if($stmt->execute()) {
            $this->id_artista = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Leer todos los artistas
    public function read() {
        $query = "SELECT a.*, COUNT(c.id_cancion) as total_canciones 
                  FROM " . $this->table_name . " a 
                  LEFT JOIN cancion c ON a.id_artista = c.id_artista 
                  GROUP BY a.id_artista 
                  ORDER BY a.seguidores DESC, a.nombre_artista ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Leer un artista específico
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE id_artista = ? 
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_artista);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->nombre_artista = $row['nombre_artista'];
            $this->verificado = $row['verificado'];
            $this->biografia = $row['biografia'];
            $this->fecha_registro = $row['fecha_registro'];
            $this->reproducciones_totales = $row['reproducciones_totales'];
            $this->seguidores = $row['seguidores'];
            $this->foto_perfil = $row['foto_perfil'];
            return true;
        }
        return false;
    }

    // Actualizar artista
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                 SET nombre_artista=:nombre_artista, verificado=:verificado, 
                     biografia=:biografia, foto_perfil=:foto_perfil 
                 WHERE id_artista=:id_artista";

        $stmt = $this->conn->prepare($query);

        $this->nombre_artista = htmlspecialchars(strip_tags($this->nombre_artista));
        $this->biografia = htmlspecialchars(strip_tags($this->biografia));

        $stmt->bindParam(":nombre_artista", $this->nombre_artista);
        $stmt->bindParam(":verificado", $this->verificado);
        $stmt->bindParam(":biografia", $this->biografia);
        $stmt->bindParam(":foto_perfil", $this->foto_perfil);
        $stmt->bindParam(":id_artista", $this->id_artista);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar artista
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id_artista = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_artista);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Buscar artistas
    public function search($keywords) {
        $query = "SELECT a.*, COUNT(c.id_cancion) as total_canciones 
                  FROM " . $this->table_name . " a 
                  LEFT JOIN cancion c ON a.id_artista = c.id_artista 
                  WHERE a.nombre_artista LIKE ? OR a.biografia LIKE ? 
                  GROUP BY a.id_artista 
                  ORDER BY a.seguidores DESC";

        $stmt = $this->conn->prepare($query);

        $keywords = htmlspecialchars(strip_tags($keywords));
        $keywords = "%{$keywords}%";

        $stmt->bindParam(1, $keywords);
        $stmt->bindParam(2, $keywords);

        $stmt->execute();
        return $stmt;
    }

    // Obtener artistas populares (más seguidores)
    public function getPopularArtists($limit = 10) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  ORDER BY seguidores DESC 
                  LIMIT ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }

    // Obtener artistas verificados
    public function getVerifiedArtists() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE verificado = 1 
                  ORDER BY nombre_artista ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }

    // Actualizar contador de seguidores
    public function updateFollowers($change) {
        $query = "UPDATE " . $this->table_name . " 
                 SET seguidores = seguidores + ? 
                 WHERE id_artista = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $change, PDO::PARAM_INT);
        $stmt->bindParam(2, $this->id_artista);
        
        return $stmt->execute();
    }

    // Obtener estadísticas del artista
    public function getArtistStats() {
        $query = "SELECT 
                    COUNT(c.id_cancion) as total_canciones,
                    SUM(c.popularidad) as total_reproducciones,
                    AVG(c.popularidad) as promedio_popularidad
                  FROM cancion c 
                  WHERE c.id_artista = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id_artista);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>