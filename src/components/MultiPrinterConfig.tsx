'use client';

import qz from 'qz-tray';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface PrinterConfig {
    kot: string;
    bot: string;
    receipt: string;
}

export function MultiPrinterConfig() {
    const [printers, setPrinters] = useState<string[]>([]);
    const [config, setConfig] = useState<PrinterConfig>({
        kot: '',
        bot: '',
        receipt: '',
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [qzAvailable, setQzAvailable] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);

    useEffect(() => {
        const savedConfig = localStorage.getItem('printerConfig');
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error('Failed to parse printer config:', e);
            }
        }

        checkQzAndLoadPrinters();

        return () => {
            if (qz && qz.websocket && qz.websocket.isActive()) {
                qz.websocket.disconnect().catch((reason: any) => {
                    console.error('Error disconnecting QZ Tray:', reason);
                });
            }
        };
    }, []);

    const checkQzAndLoadPrinters = async () => {
        try {
            if (!qz || !qz.websocket) {
                throw new Error('QZ Tray library not loaded');
            }

            if (!qz.websocket.isActive()) {
                await qz.websocket.connect();
            }

            setQzAvailable(true);
            await fetchPrinters();
        } catch (err: any) {
            console.warn('QZ Tray not available:', err.message);
            setQzAvailable(false);
            setError(
                'QZ Tray not available. Please ensure QZ Tray is installed and running.',
            );
            setLoading(false);
        }
    };

    const fetchPrinters = async () => {
        try {
            if (!qz.websocket.isActive()) {
                throw new Error('QZ Tray connection not active');
            }

            const available = await qz.printers.find();

            if (Array.isArray(available) && available.length > 0) {
                setPrinters(available);
                setError(null);
            } else {
                setPrinters([]);
                setError('No printers found on this system.');
            }
        } catch (err: any) {
            console.error('Error fetching printers:', err);
            setPrinters([]);
            setError('Failed to fetch printers: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (type: 'kot' | 'bot' | 'receipt', value: string) => {
        setConfig((prev) => ({
            ...prev,
            [type]: value,
        }));
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem('printerConfig', JSON.stringify(config));
        if (config.receipt) {
            localStorage.setItem('printerName', config.receipt);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleUseDefaultForAll = () => {
        const defaultPrinter = printers[0] || '';
        setConfig({
            kot: defaultPrinter,
            bot: defaultPrinter,
            receipt: defaultPrinter,
        });
        setSaved(false);
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        checkQzAndLoadPrinters();
    };

    if (loading) {
        return (
            <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Loading printers...</p>
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                </div>
            </div>
        );
    }

    if (error || !qzAvailable) {
        return (
            <div className="p-4 border rounded-lg bg-red-50 space-y-2">
                <p className="text-sm text-red-600 font-medium">
                    {error || 'QZ Tray not available'}
                </p>
                <Button
                    onClick={handleRetry}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                >
                    Retry Connection
                </Button>
            </div>
        );
    }

    if (printers.length === 0) {
        return (
            <div className="p-4 border rounded-lg bg-yellow-50">
                <p className="text-sm text-yellow-700">
                    No printers found. Please ensure printers are connected and
                    try again.
                </p>
                <Button
                    onClick={handleRetry}
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs"
                >
                    Refresh
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg space-y-4 bg-white">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Printer Configuration</h3>
                <Button
                    onClick={handleUseDefaultForAll}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                >
                    Use Same for All
                </Button>
            </div>

            <p className="text-sm text-gray-600">
                Configure different printers for KOT (Kitchen), BOT (Bar), and
                Receipts
            </p>

            <div className="space-y-3">
                {/* KOT Printer */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        KOT Printer (Kitchen Orders)
                    </label>
                    <select
                        className="w-full border px-3 py-2 rounded text-sm"
                        value={config.kot}
                        onChange={(e) => handleChange('kot', e.target.value)}
                    >
                        <option value="">Select Printer</option>
                        {printers.map((printer) => (
                            <option key={`kot-${printer}`} value={printer}>
                                {printer}
                            </option>
                        ))}
                    </select>
                </div>

                {/* BOT Printer */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        BOT Printer (Bar Orders)
                    </label>
                    <select
                        className="w-full border px-3 py-2 rounded text-sm"
                        value={config.bot}
                        onChange={(e) => handleChange('bot', e.target.value)}
                    >
                        <option value="">Select Printer</option>
                        {printers.map((printer) => (
                            <option key={`bot-${printer}`} value={printer}>
                                {printer}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Receipt Printer */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Receipt Printer (Customer Receipts)
                    </label>
                    <select
                        className="w-full border px-3 py-2 rounded text-sm"
                        value={config.receipt}
                        onChange={(e) =>
                            handleChange('receipt', e.target.value)
                        }
                    >
                        <option value="">Select Printer</option>
                        {printers.map((printer) => (
                            <option key={`receipt-${printer}`} value={printer}>
                                {printer}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1">
                    Save Configuration
                </Button>
                {saved && (
                    <span className="text-sm text-green-600 font-medium">
                        ✓ Saved
                    </span>
                )}
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t">
                <p>
                    <strong>Note:</strong> If a specific printer is not
                    configured, the system default will be used.
                </p>
            </div>
        </div>
    );
}
