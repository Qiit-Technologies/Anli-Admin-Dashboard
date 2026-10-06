import { useCallback, useEffect, useRef } from 'react';

interface UseAlarmOptions {
    soundPath?: string;
    volume?: number;
    playOnInitialLoad?: boolean;
    playOnIncrease?: boolean;
}

function asList(data: unknown): unknown[] | undefined {
    if (!data) return undefined;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null && Array.isArray((data as { data?: unknown }).data)) {
        return (data as { data: unknown[] }).data;
    }
    return undefined;
}

let sharedAudioContext: AudioContext | null = null;
let audioUnlocked = false;

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
    if (!Ctx) return null;
    if (!sharedAudioContext) {
        sharedAudioContext = new Ctx();
    }
    return sharedAudioContext;
}

function playBeep(volume: number): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playTone = (start: number, frequency: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.05), start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    playTone(now, 880, 0.18);
    playTone(now + 0.2, 1174, 0.22);
}

export async function unlockAlarmAudio(playTestSound = true): Promise<void> {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch {
            // Browser still blocked audio until a later gesture.
        }
    }
    audioUnlocked = true;
    if (playTestSound) {
        playBeep(0.2);
    }
}

const useAlarm = (data: unknown, options: UseAlarmOptions = {}) => {
    const {
        soundPath = '/sounds/doorbell.mp3',
        volume = 1,
        playOnInitialLoad = false,
        playOnIncrease = true,
    } = options;

    const prevCountRef = useRef<number>(0);
    const prevIdsRef = useRef<Set<string | number>>(new Set());
    const isInitialLoadRef = useRef<boolean>(true);

    const playSound = useCallback((): void => {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            void ctx.resume().then(() => {
                audioUnlocked = true;
            });
        } else if (ctx) {
            audioUnlocked = true;
        }

        try {
            const audio = new Audio(soundPath);
            audio.volume = Math.max(volume, 0.8);
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => playBeep(volume));
            }
        } catch {
            playBeep(volume);
        }
    }, [soundPath, volume]);

    useEffect(() => {
        const onFirstGesture = () => {
            void unlockAlarmAudio(false);
        };
        window.addEventListener('pointerdown', onFirstGesture, { once: true });
        return () => window.removeEventListener('pointerdown', onFirstGesture);
    }, []);

    useEffect(() => {
        const list = asList(data);
        if (!list) return;

        const currentCount = list.length;
        const currentIds = new Set(
            list.map((item, idx) => {
                const record = item as { id?: string | number } | null;
                return (record?.id ?? idx) as string | number;
            }),
        );
        const hasNewItem = Array.from(currentIds).some(
            (id) => !prevIdsRef.current.has(id),
        );

        const shouldPlayInitial =
            isInitialLoadRef.current && playOnInitialLoad && currentCount > 0;

        const shouldPlayIncrease =
            !isInitialLoadRef.current &&
            playOnIncrease &&
            (currentCount > prevCountRef.current || hasNewItem);

        if (shouldPlayInitial || shouldPlayIncrease) {
            playSound();
        }

        prevCountRef.current = currentCount;
        prevIdsRef.current = currentIds;
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
        }
    }, [data, playOnInitialLoad, playOnIncrease, playSound]);

    return { playSound, unlocked: audioUnlocked };
};

export default useAlarm;
