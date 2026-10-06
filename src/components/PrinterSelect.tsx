'use client';

import qz from 'qz-tray';
import React, { useEffect, useState } from 'react';

export function PrinterSelector() {
    const [printers, setPrinters] = useState<string[]>([]);
    const [selected, setSelected] = useState<string>(
        typeof window !== 'undefined'
            ? localStorage.getItem('printerName') || ''
            : '',
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [qzAvailable, setQzAvailable] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        let connectionTimeout: ReturnType<typeof setTimeout>;

        const checkQzAvailability = async () => {
            try {
                if (!qz || !qz.websocket) {
                    throw new Error('QZ Tray library not loaded');
                }

                connectionTimeout = setTimeout(() => {
                    if (isMounted) {
                        setError(
                            'QZ Tray connection timeout. Please ensure QZ Tray is installed and running.',
                        );
                        setLoading(false);
                    }
                }, 5000);

                if (!qz.websocket.isActive()) {
                    // Connect to QZ Tray
                    // This will trigger certificate dialog if needed
                    await qz.websocket.connect();

                    // Wait a bit to ensure connection is fully established
                    // This helps prevent "Connection closed before response received" errors
                    await new Promise((resolve) => setTimeout(resolve, 150));
                }

                clearTimeout(connectionTimeout);

                // Verify connection is still active after the delay
                if (!qz.websocket.isActive()) {
                    throw new Error('Connection failed to establish');
                }

                if (isMounted) {
                    setQzAvailable(true);
                    await fetchPrinters();
                }
            } catch (err: any) {
                clearTimeout(connectionTimeout);
                console.warn('QZ Tray not available:', err.message);

                if (isMounted) {
                    setQzAvailable(false);
                    setError(
                        'QZ Tray not available. Printing functionality will be limited.',
                    );
                    setLoading(false);
                }
            }
        };

        const fetchPrinters = async () => {
            try {
                // Double-check connection is still active before fetching
                if (!qz.websocket || !qz.websocket.isActive()) {
                    throw new Error('QZ Tray connection not active');
                }

                // Add a small delay to ensure connection is fully established
                // This helps prevent "Connection closed before response received" errors
                await new Promise((resolve) => setTimeout(resolve, 100));

                const available = await qz.printers.find();

                if (isMounted) {
                    if (Array.isArray(available) && available.length > 0) {
                        setPrinters(available);
                        setError(null);
                    } else {
                        setPrinters([]);
                        setError('No printers found on this system.');
                    }
                }
            } catch (err: any) {
                console.error('Error fetching printers:', err);
                if (isMounted) {
                    setPrinters([]);
                    // Provide more helpful error message
                    const errorMsg =
                        err.message?.includes('Connection closed') ||
                        err.message?.includes('before response')
                            ? 'QZ Tray connection was interrupted. Please try again.'
                            : err.message || 'Unknown error';
                    setError('Failed to fetch printers: ' + errorMsg);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
                // Don't disconnect here - keep connection open for potential use
                // The cleanup function will handle disconnection on unmount
            }
        };

        checkQzAvailability();

        return () => {
            isMounted = false;
            if (connectionTimeout) {
                clearTimeout(connectionTimeout);
            }

            if (qz && qz.websocket && qz.websocket.isActive()) {
                qz.websocket.disconnect().catch(() => {});
            }
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelected(value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('printerName', value);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        window.location.reload();
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
                Select Printer:
            </label>

            {loading ? (
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Loading printers...</p>
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                </div>
            ) : error ? (
                <div className="space-y-2">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            ) : !qzAvailable ? (
                <div className="space-y-2">
                    <p className="text-sm text-yellow-600">
                        QZ Tray is not available. You can still use system
                        default printing.
                    </p>
                    <select
                        className="w-full border px-2 py-1 rounded text-sm bg-gray-50"
                        value="system-default"
                        disabled
                    >
                        <option value="system-default">
                            System Default (QZ Tray unavailable)
                        </option>
                    </select>
                </div>
            ) : printers.length === 0 ? (
                <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                        No printers available.
                    </p>
                    <select
                        className="w-full border px-2 py-1 rounded text-sm bg-gray-50"
                        value=""
                        disabled
                    >
                        <option value="">No printers found</option>
                    </select>
                </div>
            ) : (
                <select
                    className="w-full border px-2 py-1 rounded text-sm"
                    value={selected}
                    onChange={handleChange}
                >
                    <option value="">System Default</option>
                    {printers.map((printer) => (
                        <option key={printer} value={printer}>
                            {printer}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}
