import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { audioUrl } from '../media';

const PlayerContext = createContext();

/**
 * Playback state for the whole app.
 *
 * A single detached `<audio>` element is driven from here, so playback survives
 * navigation between routes. Tracks that have no `archivo_audio` still become
 * the "current song" — they just cannot make sound, and the player reflects
 * that by disabling transport instead of silently doing nothing.
 */
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

    // `ended` fires on a listener registered once, but must act on the queue
    // and repeat mode that are current *at that moment*. Keeping a ref in sync
    // avoids re-binding the listener, which would otherwise reset playback.
    const stateRef = useRef({ queue, currentIndex, repeatMode });
    useEffect(() => {
        stateRef.current = { queue, currentIndex, repeatMode };
    }, [queue, currentIndex, repeatMode]);

    /** Point the audio element at `song` and start playback when possible. */
    const loadSong = useCallback((song) => {
        if (!song) return;

        setCurrentSong(song);
        setProgress(0);
        setDuration(0);

        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();

        if (!song.archivo_audio) {
            audio.removeAttribute('src');
            audio.load();
            setIsPlaying(false);
            return;
        }

        audio.src = audioUrl(song.archivo_audio);
        audio
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
                console.error('Play error:', err);
                setIsPlaying(false);
            });
    }, []);

    const playAtIndex = useCallback(
        (index) => {
            const list = stateRef.current.queue;
            if (list.length === 0 || index < 0 || index >= list.length) return;
            setCurrentIndex(index);
            loadSong(list[index]);
        },
        [loadSong]
    );

    const playSong = useCallback(
        (song, songQueue = null) => {
            if (!song) return;

            if (songQueue) {
                setQueue(songQueue);
                const index = songQueue.findIndex((s) => s.id_cancion === song.id_cancion);
                setCurrentIndex(index >= 0 ? index : 0);
            } else {
                setQueue([song]);
                setCurrentIndex(0);
            }

            loadSong(song);
        },
        [loadSong]
    );

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = volume;

        const audio = audioRef.current;

        const handleTimeUpdate = () => setProgress(audio.currentTime);
        const handleLoadedMetadata = () =>
            setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
        const handleEnded = () => {
            const { queue: q, currentIndex: i, repeatMode: r } = stateRef.current;

            if (r === 2) {
                audio.currentTime = 0;
                audio.play().catch(() => setIsPlaying(false));
                return;
            }
            if (i < q.length - 1) {
                playAtIndex(i + 1);
            } else if (r === 1) {
                playAtIndex(0);
            } else {
                setIsPlaying(false);
            }
        };
        const handleError = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.pause();
            audioRef.current = null;
        };
    }, [playAtIndex]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else if (currentSong?.archivo_audio) {
            audioRef.current
                ?.play()
                .then(() => setIsPlaying(true))
                .catch((err) => console.error(err));
        }
    }, [isPlaying, currentSong, pause]);

    const next = useCallback(() => {
        const list = stateRef.current.queue;
        if (list.length === 0) return;

        if (isShuffle) {
            // Avoid re-picking the current track when there are alternatives.
            if (list.length === 1) return;
            let pick = currentIndex;
            while (pick === currentIndex) {
                pick = Math.floor(Math.random() * list.length);
            }
            playAtIndex(pick);
        } else if (currentIndex < list.length - 1) {
            playAtIndex(currentIndex + 1);
        } else if (repeatMode === 1) {
            playAtIndex(0);
        }
    }, [currentIndex, isShuffle, repeatMode, playAtIndex]);

    const prev = useCallback(() => {
        if (queue.length === 0) return;

        // Spotify restarts the track first, then steps back.
        if (progress > 3) {
            if (audioRef.current) audioRef.current.currentTime = 0;
            setProgress(0);
            return;
        }
        if (currentIndex > 0) {
            playAtIndex(currentIndex - 1);
        } else if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setProgress(0);
        }
    }, [queue.length, currentIndex, progress, playAtIndex]);

    const seekTo = useCallback((time) => {
        const audio = audioRef.current;
        const max = audio && Number.isFinite(audio.duration) ? audio.duration : 0;
        const clamped = Math.max(0, max ? Math.min(time, max) : time);
        if (audio) audio.currentTime = clamped;
        setProgress(clamped);
    }, []);

    const changeVolume = useCallback((vol) => {
        const v = Math.max(0, Math.min(1, vol));
        if (audioRef.current) audioRef.current.volume = v;
        setVolume(v);
    }, []);

    const toggleShuffle = useCallback(() => setIsShuffle((p) => !p), []);

    const toggleRepeat = useCallback(
        () => setRepeatMode((p) => (p + 1) % 3),
        []
    );

    /** Append to the queue, or remove the track if it is already queued. */
    const addToQueue = useCallback((song) => {
        if (!song) return;
        setQueue((prev) =>
            prev.some((s) => s.id_cancion === song.id_cancion)
                ? prev
                : [...prev, song]
        );
    }, []);

    /** Play `song` immediately after the current track. */
    const playNextInQueue = useCallback((song) => {
        if (!song) return;
        setQueue((prev) => {
            const without = prev.filter((s) => s.id_cancion !== song.id_cancion);
            const at = Math.min(stateRef.current.currentIndex + 1, without.length);
            return [...without.slice(0, at), song, ...without.slice(at)];
        });
    }, []);

    const clearQueue = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        }
        setQueue([]);
        setCurrentIndex(0);
        setCurrentSong(null);
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
    }, []);

    return (
        <PlayerContext.Provider
            value={{
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
                playAt: playAtIndex,
                pause,
                togglePlay,
                next,
                prev,
                seekTo,
                setVolume: changeVolume,
                addToQueue,
                playNextInQueue,
                clearQueue,
                toggleShuffle,
                toggleRepeat
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    return useContext(PlayerContext);
}

export default PlayerContext;
