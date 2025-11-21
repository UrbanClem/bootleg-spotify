// Funciones auxiliares para el reproductor global
function initializeSongCards() {
    // Esta función se puede llamar después de cargar contenido dinámico
    document.querySelectorAll('.play-song-btn').forEach(button => {
        button.addEventListener('click', function() {
            const songData = {
                src: this.dataset.songSrc,
                title: this.dataset.songTitle,
                artist: this.dataset.songArtist,
                cover: this.dataset.songCover
            };
            
            if (window.playSong) {
                window.playSong(songData);
            }
        });
    });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initializeSongCards);