'use client';

import BrandButton from '@/components/common/Button';
import { Button } from '@/components/ui/button';
import {
    applyCameraZoom,
    classifyScannerError,
    formatLastScanLabel,
    getCameraZoomRange,
    isBenignScanError,
    isIOSDevice,
    isSecureCameraContext,
    scannerCompatibilityTips,
    scannerErrorMessage,
    type CameraZoomRange,
} from '@/lib/membership/qr-scanner-utils';
import { cn } from '@/lib/utils';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
    AlertTriangle,
    Camera,
    CameraOff,
    ChevronDown,
    ChevronUp,
    Loader2,
    Minus,
    Plus,
    RotateCcw,
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (error: string) => void;
    isScanning: boolean;
    onToggleScanning: () => void;
    continuous?: boolean;
    lastScanLabel?: string | null;
    isValidating?: boolean;
}

const SCAN_COOLDOWN_MS = 1800;

/** Decode the full viewfinder so small and large codes are both in range. */
const SCAN_CONFIG = {
    fps: 10,
    disableFlip: false,
} as const;

const QRScanner = ({
    onScanSuccess,
    onScanError,
    isScanning,
    onToggleScanning,
    continuous = false,
    lastScanLabel,
    isValidating = false,
}: Readonly<QRScannerProps>) => {
    const readerId = useId().replace(/:/g, '');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const lastScanRef = useRef<{ code: string; at: number } | null>(null);
    const startingRef = useRef(false);

    const [isStarting, setIsStarting] = useState(false);
    const [lastDetected, setLastDetected] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [showTips, setShowTips] = useState(false);
    const [zoomRange, setZoomRange] = useState<CameraZoomRange | null>(null);

    const onScanSuccessRef = useRef(onScanSuccess);
    const onScanErrorRef = useRef(onScanError);
    const onToggleScanningRef = useRef(onToggleScanning);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
        onScanErrorRef.current = onScanError;
        onToggleScanningRef.current = onToggleScanning;
    }, [onScanSuccess, onScanError, onToggleScanning]);

    const stopScanner = useCallback(async () => {
        const instance = scannerRef.current;
        scannerRef.current = null;
        if (!instance) return;
        try {
            const state = instance.getState();
            if (state === 2 /* SCANNING */) {
                await instance.stop();
            }
            instance.clear();
        } catch {
            /* ignore cleanup races */
        }
    }, []);

    const startScanner = useCallback(async () => {
        if (startingRef.current || scannerRef.current) return;
        if (!isSecureCameraContext()) {
            const msg = scannerErrorMessage('insecure');
            setCameraError(msg);
            onScanErrorRef.current?.(msg);
            return;
        }

        startingRef.current = true;
        setIsStarting(true);
        setCameraError(null);
        setLastDetected(null);
        setZoomRange(null);

        const elementId = `qr-reader-${readerId}`;
        const instance = new Html5Qrcode(elementId, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
        });
        scannerRef.current = instance;

        const onDecoded = (decodedText: string) => {
            const now = Date.now();
            const last = lastScanRef.current;
            if (
                last &&
                last.code === decodedText &&
                now - last.at < SCAN_COOLDOWN_MS
            ) {
                return;
            }
            lastScanRef.current = { code: decodedText, at: now };
            setLastDetected(decodedText);
            onScanSuccessRef.current(decodedText);

            if (!continuous) {
                void stopScanner().then(() => onToggleScanningRef.current());
            }
        };

        const onDecodeError = (errorMessage: string) => {
            if (!isBenignScanError(String(errorMessage))) {
                console.warn('QR decode:', errorMessage);
            }
        };

        const cameraAttempts: Array<{ facingMode: string }> = [
            { facingMode: 'environment' },
            { facingMode: 'user' },
        ];

        let started = false;
        let lastError = '';

        for (const camera of cameraAttempts) {
            try {
                await instance.start(
                    camera,
                    SCAN_CONFIG,
                    onDecoded,
                    onDecodeError,
                );
                setZoomRange(getCameraZoomRange(instance));
                started = true;
                break;
            } catch (err) {
                lastError = err instanceof Error ? err.message : String(err);
                try {
                    const state = instance.getState();
                    if (state === 2) {
                        await instance.stop();
                    }
                } catch {
                    /* try next camera */
                }
            }
        }

        startingRef.current = false;
        setIsStarting(false);

        if (!started) {
            let kind = classifyScannerError(lastError);
            if (isIOSDevice() && kind === 'generic') {
                kind = 'ios';
            }
            const friendly = scannerErrorMessage(kind);
            setCameraError(friendly);
            onScanErrorRef.current?.(friendly);
            scannerRef.current = null;
            try {
                instance.clear();
            } catch {
                /* noop */
            }
            onToggleScanningRef.current();
        }
    }, [readerId, continuous, stopScanner]);

    useEffect(() => {
        if (isScanning) {
            void startScanner();
        } else {
            void stopScanner();
        }

        return () => {
            void stopScanner();
        };
    }, [isScanning, startScanner, stopScanner]);

    const handleZoomStep = async (direction: 'in' | 'out') => {
        const instance = scannerRef.current;
        if (!instance || !zoomRange) return;
        const delta = direction === 'in' ? zoomRange.step : -zoomRange.step;
        const next = await applyCameraZoom(instance, zoomRange.current + delta);
        setZoomRange({ ...zoomRange, current: next });
    };

    const handleReset = async () => {
        await stopScanner();
        setCameraError(null);
        setLastDetected(null);
        setZoomRange(null);
        lastScanRef.current = null;
        if (!isScanning) {
            onToggleScanning();
        } else {
            void startScanner();
        }
    };

    const lastScanDisplay =
        lastScanLabel ??
        (lastDetected ? formatLastScanLabel(lastDetected) : null);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full',
                            isScanning
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500',
                        )}
                    >
                        <Camera className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            QR Scanner
                        </p>
                        <p className="text-xs text-gray-500">
                            {isScanning
                                ? 'Fill the view with the code — any size'
                                : 'Tap start to open camera'}
                        </p>
                    </div>
                </div>
                {isScanning ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Live
                    </span>
                ) : null}
            </div>

            <div className="space-y-3 p-3 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <BrandButton
                        type="button"
                        onClick={onToggleScanning}
                        disabled={isStarting}
                        loading={isStarting}
                        fullWidth
                        icon={
                            !isStarting && !isScanning ? (
                                <Camera className="h-4 w-4" />
                            ) : !isStarting && isScanning ? (
                                <CameraOff className="h-4 w-4" />
                            ) : undefined
                        }
                        className={cn(
                            'h-11 shrink-0 sm:flex-1',
                            isScanning && 'bg-red-600 hover:bg-red-700',
                        )}
                    >
                        {isStarting
                            ? 'Starting…'
                            : isScanning
                              ? 'Stop camera'
                              : 'Start scanning'}
                    </BrandButton>

                    {(isScanning || cameraError) && !isStarting ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void handleReset()}
                            className="h-11 w-full shrink-0 gap-2 sm:w-auto sm:min-w-[140px]"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                    ) : null}
                </div>

                <div
                    className={cn(
                        'relative overflow-hidden rounded-xl bg-gray-950',
                        isScanning
                            ? 'min-h-[min(72vw,400px)] sm:min-h-[360px]'
                            : 'min-h-[100px] sm:min-h-[120px]',
                    )}
                >
                    <div
                        id={`qr-reader-${readerId}`}
                        className={cn(
                            'w-full [&_video]:!rounded-xl',
                            !isScanning && 'hidden',
                        )}
                    />

                    {!isScanning && !cameraError ? (
                        <div className="flex min-h-[120px] flex-col items-center justify-center px-4 py-6 text-center text-gray-400">
                            <Camera className="mb-2 h-8 w-8 opacity-40" />
                            <p className="text-sm">Camera preview paused</p>
                        </div>
                    ) : null}

                    {isScanning && !isStarting ? (
                        <div
                            className="pointer-events-none absolute inset-4 rounded-lg border-2 border-white/35"
                            aria-hidden
                        >
                            <span className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-emerald-400" />
                            <span className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-emerald-400" />
                            <span className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-emerald-400" />
                            <span className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-emerald-400" />
                        </div>
                    ) : null}

                    {isStarting ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80">
                            <Loader2 className="h-8 w-8 animate-spin text-white/80" />
                        </div>
                    ) : null}
                </div>

                {isScanning && zoomRange && !isStarting ? (
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            disabled={zoomRange.current <= zoomRange.min}
                            onClick={() => void handleZoomStep('out')}
                            aria-label="Zoom out"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[4.5rem] text-center text-xs font-medium text-gray-600">
                            {zoomRange.current.toFixed(1)}× zoom
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            disabled={zoomRange.current >= zoomRange.max}
                            onClick={() => void handleZoomStep('in')}
                            aria-label="Zoom in"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null}

                {isValidating || lastScanDisplay ? (
                    <p className="text-center text-xs text-gray-500">
                        {isValidating ? (
                            <span className="inline-flex items-center justify-center gap-1.5 text-orion-blue">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Validating member…
                            </span>
                        ) : (
                            <>
                                Last scan:{' '}
                                <span className="font-medium text-gray-800">
                                    {lastScanDisplay}
                                </span>
                            </>
                        )}
                    </p>
                ) : null}

                {cameraError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
                        <div className="flex gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{cameraError}</p>
                        </div>
                    </div>
                ) : null}

                <button
                    type="button"
                    onClick={() => setShowTips((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                    {isIOSDevice()
                        ? 'Scanner not working on this iPhone?'
                        : 'Scanner not working on this device?'}
                    {showTips ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>

                {showTips ? (
                    <ul className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3 text-xs leading-relaxed text-gray-600">
                        {scannerCompatibilityTips().map((tip) => (
                            <li key={tip} className="flex gap-2">
                                <span className="text-orion-blue">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>
    );
};

export default QRScanner;
