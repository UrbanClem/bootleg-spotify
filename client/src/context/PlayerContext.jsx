import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = volume;

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            if (repeatMode === 2) {
                audio.currentTime = 0;
                audio.play();
            } else if (currentIndex < queue.length - 1) {
                playAtIndex(currentIndex + 1);
            } else if (repeatMode === 1) {
                playAtIndex(0);
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, []);

    const playAtIndex = useCallback((index) => {
        if (queue.length === 0 || index < 0 || index >= queue.length) return;
        const song = queue[index];
        if (!song || !song.archivo_audio) return;

        const audio = audioRef.current;
        audio.src = `/uploads/audio/${song.archivo_audio}`;
        audio.play().then(() => {
            setIsPlaying(true);
            setCurrentIndex(index);
            setCurrentSong(song);
        }).catch(err => console.error('Play error:', err));
    }, [queue]);

    const playSong = useCallback((song, songQueue = null) => {
        if (songQueue) {
            setQueue(songQueue);
            const index = songQueue.findIndex(s => s.id_cancion === song.id_cancion);
            setCurrentIndex(index >= 0 ? index : 0);
        } else {
            setQueue([song]);
            setCurrentIndex(0);
        }

        if (!song.archivo_audio) return;

        const audio = audioRef.current;
        audio.src = `/uploads/audio/${song.archivo_audio}`;
        audio.play().then(() => {
            setIsPlaying(true);
            setCurrentSong(song);
        }).catch(err => console.error('Play error:', err));
    }, []);

    const pause = useCallback(() => {
        audioRef.current.pause();
        setIsPlaying(false);
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else if (currentSong) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(err => console.error(err));
        }
    }, [isPlaying, currentSong, pause]);

    const next = useCallback(() => {
        if (queue.length === 0) return;
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * queue.length);
            playAtIndex(randomIndex);
        } else if (currentIndex < queue.length - 1) {
            playAtIndex(currentIndex + 1);
        } else if (repeatMode === 1) {
            playAtIndex(0);
        }
    }, [queue, currentIndex, isShuffle, repeatMode, playAtIndex]);

    const prev = useCallback(() => {
        if (queue.length === 0) return;
        if (progress > 3) {
            audioRef.current.currentTime = 0;
            return;
        }
        if (currentIndex > 0) {
            playAtIndex(currentIndex - 1);
        } else {
            audioRef.current.currentTime = 0;
        }
    }, [queue, currentIndex, progress, playAtIndex]);

    const seekTo = useCallback((time) => {
        audioRef.current.currentTime = time;
        setProgress(time);
    }, []);

    const changeVolume = useCallback((vol) => {
        const v = Math.max(0, Math.min(1, vol));
        audioRef.current.volume = v;
        setVolume(v);
    }, []);

    const toggleShuffle = useCallback(() => {
        setIsShuffle(prev => !prev);
    }, []);

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => (prev + 1) % 3);
    }, []);

    const addToQueue = useCallback((song) => {
        setQueue(prev => [...prev, song]);
    }, []);

    const clearQueue = useCallback(() => {
        setQueue([]);
        setCurrentIndex(0);
        setCurrentSong(null);
        setIsPlaying(false);
        audioRef.current.pause();
        audioRef.current.src = '';
    }, []);

    return (
        <PlayerContext.Provider value={{
            currentSong,
            queue,
            currentIndex,
            isPlaying,
            progress,
            duration,
            volume,
            isShuffle,
            repeatMode,
            playSong,
            pause,
            togglePlay,
            next,
            prev,
            seekTo,
            setVolume: changeVolume,
            addToQueue,
            clearQueue,
            toggleShuffle,
            toggleRepeat,
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    return useContext(PlayerContext);
}

export default PlayerContext;
