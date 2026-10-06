import type { Html5Qrcode } from 'html5-qrcode';

export type ScannerIssueKind =
    | 'permission'
    | 'not-found'
    | 'not-allowed'
    | 'insecure'
    | 'ios'
    | 'generic';

export function classifyScannerError(message: string): ScannerIssueKind {
    const lower = message.toLowerCase();
    if (
        lower.includes('secure') ||
        lower.includes('https') ||
        lower.includes('insecure')
    ) {
        return 'insecure';
    }
    if (
        lower.includes('permission') ||
        lower.includes('notallowed') ||
        lower.includes('not allowed')
    ) {
        return 'permission';
    }
    if (lower.includes('notfound') || lower.includes('not found')) {
        return 'not-found';
    }
    if (lower.includes('ios') || lower.includes('safari')) {
        return 'ios';
    }
    return 'generic';
}

export function scannerErrorMessage(kind: ScannerIssueKind): string {
    switch (kind) {
        case 'insecure':
            return 'Camera requires HTTPS. Open this page over a secure connection.';
        case 'permission':
            return isIOSDevice()
                ? 'Camera blocked on iPhone. Tap aA in Safari’s address bar → Website Settings → Camera → Allow. Or Settings → Safari → Camera.'
                : 'Camera access was denied. Allow camera permission in browser settings.';
        case 'not-found':
            return 'No camera found on this device.';
        case 'not-allowed':
            return 'Camera is blocked. Check site permissions and try again.';
        case 'ios':
            return 'On iPhone/iPad use Safari, tap Start Scanning, and allow camera access.';
        default:
            return 'Could not start the camera. Try Reset Camera or use another browser.';
    }
}

export function isIOSDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return (
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
}

/** iPhone/iPad-specific guidance — most failures here are permission or in-app browser. */
export function iosScannerTips(): string[] {
    return [
        'Open this page in Safari — not inside WhatsApp, Instagram, or Mail previews.',
        'Tap Start scanning first; iOS only allows the camera after your tap.',
        'When Safari asks, tap Allow for camera access (not Don\'t Allow).',
        'If blocked before: Settings → Safari → Camera → set to Ask or Allow.',
        'Per-site fix: Safari → aA icon in address bar → Website Settings → Camera → Allow.',
        'If preview stays black: close other camera apps, then tap Reset on this page.',
    ];
}

export function scannerCompatibilityTips(): string[] {
    const common = [
        'The site must be opened over HTTPS (not plain HTTP).',
        'Allow camera permission when prompted — blocking it once often breaks scanning until settings are changed.',
        'Fill the camera view with the code — small codes work if you move closer.',
        'Use the zoom buttons when shown; good lighting and a steady hand help.',
        'If the preview is black, tap Reset camera or fully refresh the page.',
    ];

    if (isIOSDevice()) {
        return [...iosScannerTips(), ...common];
    }

    return [
        'Use Chrome or Safari on a phone or tablet with a working rear camera.',
        ...common,
        'Some in-app browsers (WhatsApp, Instagram) block camera — open in Chrome/Safari.',
    ];
}

export function isSecureCameraContext(): boolean {
    if (typeof window === 'undefined') return true;
    return (
        window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    );
}

export function formatLastScanLabel(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return '';

    try {
        const data = JSON.parse(trimmed) as {
            type?: string;
            memberId?: string;
        };
        if (data.type === 'MEMBER_CHECKIN') {
            return 'Membership card';
        }
        if (data.memberId) {
            const id = String(data.memberId);
            return id.length > 12
                ? `Member ···${id.slice(-8)}`
                : `Member ${id}`;
        }
    } catch {
        if (trimmed.length > 24) {
            return `Member ···${trimmed.slice(-8)}`;
        }
        return `Member ${trimmed}`;
    }

    return 'Code scanned';
}

export type CameraZoomRange = {
    min: number;
    max: number;
    step: number;
    current: number;
};

export function getCameraZoomRange(
    instance: Html5Qrcode,
): CameraZoomRange | null {
    try {
        const zoom = instance.getRunningTrackCameraCapabilities().zoomFeature();
        if (!zoom.isSupported()) return null;
        return {
            min: zoom.min(),
            max: zoom.max(),
            step: zoom.step() > 0 ? zoom.step() : 0.1,
            current: zoom.value() ?? zoom.min(),
        };
    } catch {
        return null;
    }
}

export async function applyCameraZoom(
    instance: Html5Qrcode,
    value: number,
): Promise<number> {
    const zoom = instance.getRunningTrackCameraCapabilities().zoomFeature();
    if (!zoom.isSupported()) return value;
    const clamped = Math.min(zoom.max(), Math.max(zoom.min(), value));
    await zoom.apply(clamped);
    return clamped;
}

export function isBenignScanError(message: string): boolean {
    const ignored = [
        'no qr code found',
        'qr code parse error',
        'notfoundexception',
        'no multiformat readers',
        'unable to decode',
        'not found',
    ];
    const lower = message.toLowerCase();
    return ignored.some((part) => lower.includes(part));
}
