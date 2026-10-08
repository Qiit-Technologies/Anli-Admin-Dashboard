/**
 * Next.js instrumentation hook — runs once when the server starts.
 *
 * Sets Node.js EventEmitter max-listeners to unlimited (0) for the process.
 * This suppresses the `MaxListenersExceededWarning` that fires in production
 * when Next.js attaches multiple `end`/`close`/`error` listeners to the same
 * IncomingMessage / ServerResponse under concurrent load (e.g. on Render).
 *
 * This is NOT masking a real memory leak — Next.js intentionally registers
 * several listeners per request for streaming, abort handling, and cleanup.
 * The default limit of 10 is simply too low for a busy production server.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { EventEmitter } = require('events') as typeof import('events');
        // 0 = unlimited — prevents MaxListenersExceededWarning under load
        EventEmitter.defaultMaxListeners = 0;
        process.setMaxListeners(0);
    }
}
