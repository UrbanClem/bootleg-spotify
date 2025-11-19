<?php
class UploadHelper {
    
    // Subir imagen de artista
    public static function uploadArtistImage($file, $artistName) {
        $uploadDir = 'uploads/artists/';
        
        // Crear directorio si no existe
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Validar que sea una imagen
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $fileType = $file['type'];
        
        if (!in_array($fileType, $allowedTypes)) {
            return ['success' => false, 'error' => 'Solo se permiten archivos JPEG, PNG, GIF y WebP.'];
        }
        
        // Validar tamaño (máximo 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'error' => 'La imagen no debe superar los 5MB.'];
        }
        
        // Generar nombre único para el archivo
        $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $safeArtistName = preg_replace('/[^a-zA-Z0-9]/', '_', $artistName);
        $fileName = $safeArtistName . '_' . uniqid() . '.' . $fileExtension;
        $filePath = $uploadDir . $fileName;
        
        // Mover archivo
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            return ['success' => true, 'file_name' => $fileName];
        } else {
            return ['success' => false, 'error' => 'Error al subir la imagen.'];
        }
    }
    
    // Eliminar imagen anterior
    public static function deleteOldImage($fileName) {
        if (!empty($fileName)) {
            $filePath = 'uploads/artists/' . $fileName;
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
    }
}
?>