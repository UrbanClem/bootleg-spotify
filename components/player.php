<?php
// Componente del reproductor que se incluirá en todas las páginas
?>
<div id="global-player" class="global-player">
    <div class="player-container">
        <!-- Información de la canción actual -->
        <div class="song-info">
            <div class="album-cover">
                <img id="current-song-cover" src="" alt="Portada">
            </div>
            <div class="song-details">
                <div id="current-song-title" class="song-title">No hay canción seleccionada</div>
                <div id="current-song-artist" class="song-artist">Selecciona una canción para reproducir</div>
            </div>
        </div>

        <!-- Controles del reproductor -->
        <div class="player-controls">
            <button id="prev-btn" class="control-btn" title="Anterior">
                <i class="fas fa-step-backward"></i>
            </button>
            <button id="play-pause-btn" class="control-btn play-pause" title="Reproducir/Pausar">
                <i class="fas fa-play"></i>
            </button>
            <button id="next-btn" class="control-btn" title="Siguiente">
                <i class="fas fa-step-forward"></i>
            </button>
        </div>

        <!-- Barra de progreso -->
        <div class="progress-container">
            <span id="current-time" class="time">0:00</span>
            <div class="progress-bar">
                <div id="progress" class="progress"></div>
            </div>
            <span id="duration" class="time">0:00</span>
        </div>

        <!-- Controles de volumen -->
        <div class="volume-controls">
            <button id="mute-btn" class="control-btn" title="Silenciar">
                <i class="fas fa-volume-up"></i>
            </button>
            <div class="volume-bar">
                <div id="volume-level" class="volume-progress"></div>
            </div>
        </div>
    </div>

    <!-- Audio element (oculto) -->
    <audio id="global-audio" preload="metadata"></audio>
</div>

<script>
class GlobalPlayer {
    constructor() {
        this.audio = document.getElementById('global-audio');
        this.isPlaying = false;
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.volume = 0.7;
        this.lastSaveTime = 0;

        this.initializeElements();
        this.initializeEventListeners();
        this.restorePlayerState();
    }

    initializeElements() {
        // Botones
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.muteBtn = document.getElementById('mute-btn');

        // Información de la canción
        this.songTitle = document.getElementById('current-song-title');
        this.songArtist = document.getElementById('current-song-artist');
        this.songCover = document.getElementById('current-song-cover');

        // Progreso
        this.progress = document.getElementById('progress');
        this.currentTime = document.getElementById('current-time');
        this.duration = document.getElementById('duration');
        this.progressContainer = document.querySelector('.progress-bar');

        // Volumen
        this.volumeLevel = document.getElementById('volume-level');
        this.volumeBar = document.querySelector('.volume-bar');
    }

    initializeEventListeners() {
        // Controles de reproducción
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.previousSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());

        // Barra de progreso
        this.progressContainer.addEventListener('click', (e) => this.setProgress(e));

        // Controles de volumen
        this.volumeBar.addEventListener('click', (e) => this.setVolume(e));
        this.muteBtn.addEventListener('click', () => this.toggleMute());

        // Eventos del audio
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextSong());
        this.audio.addEventListener('volumechange', () => this.updateVolumeUI());

        // Guardar estado antes de que la página se cierre
        window.addEventListener('beforeunload', () => this.savePlayerState());
        
        // Sincronización entre pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === 'globalPlayerState') {
                this.handleStorageChange(e);
            }
        });

        // Guardar estado periódicamente
        setInterval(() => this.savePlayerState(), 2000);
    }

    // Restaurar estado del reproductor desde localStorage
    restorePlayerState() {
        try {
            const savedState = localStorage.getItem('globalPlayerState');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Verificar si el estado no es muy viejo (10 minutos)
                if (Date.now() - (state.timestamp || 0) < 600000) {
                    this.currentPlaylist = state.playlist || [];
                    this.currentIndex = state.currentIndex || 0;
                    this.volume = state.volume || 0.7;
                    this.audio.volume = this.volume;
                    
                    const currentSong = state.currentSong;
                    if (currentSong && currentSong.src) {
                        this.loadSong(currentSong, false);
                        
                        // Restaurar tiempo de reproducción después de que se cargue el metadata
                        this.audio.addEventListener('loadedmetadata', () => {
                            if (state.currentTime && state.currentTime < this.audio.duration) {
                                this.audio.currentTime = state.currentTime;
                            }
                            
                            if (state.isPlaying) {
                                // Pequeño delay para asegurar que el audio esté listo
                                setTimeout(() => {
                                    this.play().catch(e => console.log('Auto-play prevented:', e));
                                }, 100);
                            }
                        }, { once: true });
                    }
                } else {
                    // Estado muy viejo, limpiar
                    localStorage.removeItem('globalPlayerState');
                }
            }
        } catch (error) {
            console.error('Error restoring player state:', error);
            localStorage.removeItem('globalPlayerState');
        }
    }

    // Guardar estado del reproductor en localStorage
    savePlayerState() {
        // Evitar guardar demasiado frecuentemente
        const now = Date.now();
        if (now - this.lastSaveTime < 1000) return;
        
        this.lastSaveTime = now;

        const state = {
            playlist: this.currentPlaylist,
            currentIndex: this.currentIndex,
            currentSong: this.currentPlaylist[this.currentIndex] || null,
            currentTime: this.audio.currentTime || 0,
            isPlaying: this.isPlaying,
            volume: this.volume,
            timestamp: now
        };
        
        try {
            localStorage.setItem('globalPlayerState', JSON.stringify(state));
        } catch (error) {
            console.error('Error saving player state:', error);
        }
    }

    // Manejar cambios en el almacenamiento (sincronización entre pestañas)
    handleStorageChange(e) {
        if (e.key === 'globalPlayerState' && e.newValue) {
            try {
                const newState = JSON.parse(e.newValue);
                const currentSong = this.currentPlaylist[this.currentIndex];
                
                // Solo sincronizar si es una canción diferente
                if (newState.currentSong && 
                    (!currentSong || newState.currentSong.src !== currentSong.src)) {
                    
                    this.currentPlaylist = newState.playlist || [];
                    this.currentIndex = newState.currentIndex || 0;
                    this.loadSong(newState.currentSong, false);
                    
                    if (newState.isPlaying) {
                        this.play();
                    } else {
                        this.pause();
                    }
                }
            } catch (error) {
                console.error('Error handling storage change:', error);
            }
        }
    }

    // Cargar una canción
    loadSong(song, autoPlay = true) {
        if (!song || !song.src) return;

        this.audio.src = song.src;
        this.songTitle.textContent = song.title || 'Título desconocido';
        this.songArtist.textContent = song.artist || 'Artista desconocido';
        this.songCover.src = song.cover || 'assets/default-cover.jpg';
        this.songCover.alt = song.title || 'Portada del álbum';

        if (autoPlay) {
            this.play();
        }

        this.savePlayerState();
    }

    // Reproducir canción
    play() {
        return this.audio.play().then(() => {
            this.isPlaying = true;
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.playPauseBtn.title = 'Pausar';
            this.savePlayerState();
        }).catch(error => {
            console.error('Error al reproducir:', error);
            this.isPlaying = false;
        });
    }

    // Pausar canción
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.playPauseBtn.title = 'Reproducir';
        this.savePlayerState();
    }

    // Alternar reproducción/pausa
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    // Canción anterior
    previousSong() {
        if (this.currentPlaylist.length === 0) return;
        
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.currentPlaylist.length - 1;
        this.loadSong(this.currentPlaylist[this.currentIndex]);
    }

    // Siguiente canción
    nextSong() {
        if (this.currentPlaylist.length === 0) return;
        
        this.currentIndex = this.currentIndex < this.currentPlaylist.length - 1 ? this.currentIndex + 1 : 0;
        this.loadSong(this.currentPlaylist[this.currentIndex]);
    }

    // Establecer progreso de la canción
    setProgress(e) {
        const width = this.progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audio.duration;
        
        if (duration) {
            this.audio.currentTime = (clickX / width) * duration;
            this.savePlayerState();
        }
    }

    // Actualizar barra de progreso
    updateProgress() {
        const { currentTime, duration } = this.audio;
        if (duration && !isNaN(duration)) {
            const progressPercent = (currentTime / duration) * 100;
            this.progress.style.width = `${progressPercent}%`;
            this.currentTime.textContent = this.formatTime(currentTime);
        }
    }

    // Actualizar duración
    updateDuration() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            this.duration.textContent = this.formatTime(this.audio.duration);
        }
    }

    // Establecer volumen
    setVolume(e) {
        const width = this.volumeBar.clientWidth;
        const clickX = e.offsetX;
        const volume = Math.max(0, Math.min(1, clickX / width));
        
        this.audio.volume = volume;
        this.volume = volume;
        this.updateVolumeUI();
        this.savePlayerState();
    }

    // Actualizar UI de volumen
    updateVolumeUI() {
        const volume = this.audio.volume;
        this.volumeLevel.style.width = `${volume * 100}%`;
        
        // Actualizar icono de volumen
        let volumeIcon = 'fa-volume-up';
        if (volume === 0) {
            volumeIcon = 'fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon = 'fa-volume-down';
        }
        
        this.muteBtn.innerHTML = `<i class="fas ${volumeIcon}"></i>`;
    }

    // Alternar silencio
    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.muteBtn.classList.toggle('muted', this.audio.muted);
        this.savePlayerState();
    }

    // Formatear tiempo (segundos a MM:SS)
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    // Método público para reproducir una canción desde cualquier página
    playSong(songData) {
        // Si es una sola canción, crear una playlist con ella
        this.currentPlaylist = [songData];
        this.currentIndex = 0;
        this.loadSong(songData);
    }

    // Método público para reproducir una playlist
    playPlaylist(playlist, startIndex = 0) {
        this.currentPlaylist = playlist;
        this.currentIndex = startIndex;
        this.loadSong(playlist[startIndex]);
    }
}

// Inicializar el reproductor cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.globalPlayer = new GlobalPlayer();
});

// Función global para reproducir desde cualquier parte del código
window.playSong = function(songData) {
    if (window.globalPlayer) {
        window.globalPlayer.playSong(songData);
    }
};

// Función global para reproducir playlist
window.playPlaylist = function(playlist, startIndex = 0) {
    if (window.globalPlayer) {
        window.globalPlayer.playPlaylist(playlist, startIndex);
    };
};
</script>

<style>
/* Tus estilos CSS existentes se mantienen igual */
.global-player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #181818;
    border-top: 1px solid #282828;
    padding: 10px 20px;
    z-index: 1000;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);
}

.player-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    gap: 20px;
}

.song-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 180px;
}

.album-cover {
    width: 56px;
    height: 56px;
    border-radius: 4px;
    overflow: hidden;
    background: #333;
}

.album-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.song-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.song-title {
    font-size: 14px;
    font-weight: 600;
    color: white;
}

.song-artist {
    font-size: 12px;
    color: #b3b3b3;
}

.player-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    justify-content: center;
}

.control-btn {
    background: none;
    border: none;
    color: #b3b3b3;
    font-size: 16px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.control-btn:hover {
    color: white;
    transform: scale(1.1);
}

.play-pause {
    background: white;
    color: black;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.play-pause:hover {
    background: #f0f0f0;
    transform: scale(1.05);
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 2;
    max-width: 400px;
}

.time {
    font-size: 12px;
    color: #b3b3b3;
    min-width: 40px;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: #404040;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.progress {
    height: 100%;
    background: #1db954;
    border-radius: 2px;
    width: 0%;
    transition: width 0.1s ease;
}

.volume-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: flex-end;
    min-width: 120px;
}

.volume-bar {
    width: 80px;
    height: 4px;
    background: #404040;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.volume-progress {
    height: 100%;
    background: #b3b3b3;
    border-radius: 2px;
    width: 70%;
}

/* Responsive */
@media (max-width: 768px) {
    .player-container {
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .song-info {
        flex: 100%;
        justify-content: center;
    }
    
    .player-controls {
        order: 2;
    }
    
    .progress-container {
        order: 3;
        flex: 100%;
    }
    
    .volume-controls {
        order: 4;
        justify-content: center;
    }
}

/* Estados especiales */
.control-btn.muted {
    color: #1db954;
}

.progress-bar:hover .progress {
    background: #1ed760;
}

.volume-bar:hover .volume-progress {
    background: #1db954;
}
</style>