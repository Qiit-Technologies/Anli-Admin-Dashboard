'use client';

import { getPrinters } from '@/app/actions/printer';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Network, Save, TestTube } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BrandButton from './common/Button';

interface Printer {
    id: number;
    name: string;
    ip: string;
    port: number;
}

export function IPPrinterConfig() {
    const [savedPrinters, setSavedPrinters] = useState<Printer[]>([]);
    const [selectedPrinterId, setSelectedPrinterId] = useState<string>('');
    const [printerIp, setPrinterIp] = useState('');
    const [printerPort, setPrinterPort] = useState('');
    const [stationConfig, setStationConfig] = useState({
        kot: { ip: '', port: '9100' },
        bot: { ip: '', port: '9100' },
        receipt: { ip: '', port: '9100' },
    });
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSavedPrinters();
        if (typeof window !== 'undefined') {
            const savedIp = localStorage.getItem('printerIp') || '';
            const savedPort = localStorage.getItem('printerPort') || '9100';
            setPrinterIp(savedIp);
            setPrinterPort(savedPort);
            try {
                const typed = localStorage.getItem('printerIpConfig');
                if (typed) {
                    const parsed = JSON.parse(typed);
                    setStationConfig({
                        kot: {
                            ip: parsed.kot?.ip || '',
                            port: String(parsed.kot?.port || '9100'),
                        },
                        bot: {
                            ip: parsed.bot?.ip || '',
                            port: String(parsed.bot?.port || '9100'),
                        },
                        receipt: {
                            ip: parsed.receipt?.ip || '',
                            port: String(parsed.receipt?.port || '9100'),
                        },
                    });
                }
            } catch {
                // ignore malformed local config
            }
        }
    }, []);

    async function loadSavedPrinters() {
        const result = await getPrinters();
        if (result.data) {
            setSavedPrinters(result.data);
        }
    }

    const handlePrinterSelect = (printerId: string) => {
        setSelectedPrinterId(printerId);
        const printer = savedPrinters.find(
            (p) => p.id.toString() === printerId,
        );
        if (printer) {
            setPrinterIp(printer.ip);
            setPrinterPort(printer.port.toString());
        }
    };

    const handleSave = () => {
        if (!printerIp.trim()) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Printer IP address is required"
                    type="error"
                />
            ));
            return;
        }

        const port = parseInt(printerPort, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Port must be a number between 1 and 65535"
                    type="error"
                />
            ));
            return;
        }

        setIsSaving(true);
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('printerIp', printerIp.trim());
                localStorage.setItem('printerPort', port.toString());
                localStorage.setItem(
                    'printerIpConfig',
                    JSON.stringify({
                        kot: {
                            ip: stationConfig.kot.ip.trim() || printerIp.trim(),
                            port: stationConfig.kot.port || port,
                        },
                        bot: {
                            ip: stationConfig.bot.ip.trim() || printerIp.trim(),
                            port: stationConfig.bot.port || port,
                        },
                        receipt: {
                            ip:
                                stationConfig.receipt.ip.trim() ||
                                printerIp.trim(),
                            port: stationConfig.receipt.port || port,
                        },
                    }),
                );
            }
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description="Printer configuration saved successfully"
                    type="success"
                />
            ));
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to save printer configuration"
                    type="error"
                />
            ));
        } finally {
            setIsSaving(false);
        }
    };

    const handleTest = async () => {
        if (!printerIp.trim()) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please enter a printer IP address first"
                    type="error"
                />
            ));
            return;
        }

        setIsTesting(true);
        try {
            const ipRegex =
                /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipRegex.test(printerIp.trim())) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Invalid IP address format"
                        type="error"
                    />
                ));
                return;
            }

            const port = parseInt(printerPort, 10);
            if (isNaN(port) || port < 1 || port > 65535) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Invalid port number"
                        type="error"
                    />
                ));
                return;
            }

            toast.custom(() => (
                <Toast
                    title="Info"
                    description="IP and Port format validated. Note: Actual connection test uses hotel's default printer."
                    type="success"
                />
            ));
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to test printer connection"
                    type="error"
                />
            ));
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">
                    Network Printer Configuration
                </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
                Select a saved printer or manually configure the IP address and
                port. This setting is saved locally on this device.
            </p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Select Saved Printer
                    </label>
                    <Select
                        value={selectedPrinterId}
                        onValueChange={handlePrinterSelect}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a printer..." />
                        </SelectTrigger>
                        <SelectContent>
                            {savedPrinters.map((printer) => (
                                <SelectItem
                                    key={printer.id}
                                    value={printer.id.toString()}
                                >
                                    {printer.name} ({printer.ip})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            IP Address
                        </label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="192.168.1.200"
                            value={printerIp}
                            onChange={(e) => setPrinterIp(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Port</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            type="number"
                            placeholder="9100"
                            value={printerPort}
                            onChange={(e) => setPrinterPort(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {(['kot', 'bot', 'receipt'] as const).map((station) => (
                        <div key={station} className="space-y-2">
                            <label className="text-sm font-medium uppercase">
                                {station === 'kot'
                                    ? 'Kitchen (KOT) IP'
                                    : station === 'bot'
                                      ? 'Bar (BOT) IP'
                                      : 'Receipt IP'}
                            </label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="192.168.1.201"
                                value={stationConfig[station].ip}
                                onChange={(e) =>
                                    setStationConfig((prev) => ({
                                        ...prev,
                                        [station]: {
                                            ...prev[station],
                                            ip: e.target.value,
                                        },
                                    }))
                                }
                            />
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 pt-2">
                    <BrandButton
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                        icon={<Save className="w-4 h-4" />}
                        iconPosition="left"
                        loading={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </BrandButton>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTest}
                        disabled={isTesting}
                        className="flex items-center gap-2"
                    >
                        <TestTube className="w-4 h-4" />
                        {isTesting ? 'Testing...' : 'Validate'}
                    </Button>
                </div>

                {printerIp && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs text-gray-600">
                            <strong>Current Configuration:</strong>
                            <br />
                            IP: {printerIp || 'Not set'}
                            <br />
                            Port: {printerPort || '9100'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
