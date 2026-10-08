'use client';

import { fetchHotelDetailsById, updateHotel } from '@/app/actions/hotel';
import { testPrinterConnection } from '@/app/actions/print';
import { InputField } from '@/components/common/Form';
import Toast from '@/components/toast';
import {
    CheckCircle2,
    Info,
    Network,
    Save,
    TestTube,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BrandButton from './common/Button';

export function GatewayConfig() {
    const [gatewayUrl, setGatewayUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [hotelId, setHotelId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    useEffect(() => {
        async function loadHotelSettings() {
            try {
                const result = await fetchHotelDetailsById();
                if (result.data) {
                    setHotelId(result.data.id);
                    setGatewayUrl(result.data.printGatewayUrl || '');
                    setApiKey(result.data.printGatewayApiKey || '');
                }
            } catch (error: any) {
                console.error('Failed to load hotel settings:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadHotelSettings();
    }, []);

    const handleSave = async () => {
        if (!hotelId) return;

        setIsSaving(true);
        try {
            const result = await updateHotel(hotelId, {
                printGatewayUrl: gatewayUrl || null,
                printGatewayApiKey: apiKey || null,
            });

            if (result.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Gateway configuration saved successfully"
                        type="success"
                    />
                ));
                setTestResult(null); // Clear test result after save
            } else {
                throw new Error(result.error || 'Failed to save');
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to save gateway configuration"
                    type="error"
                />
            ));
        } finally {
            setIsSaving(false);
        }
    };

    const handleTest = async () => {
        if (!gatewayUrl) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please enter a gateway URL first"
                    type="error"
                />
            ));
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            // Save config first if not saved
            if (hotelId) {
                await updateHotel(hotelId, {
                    printGatewayUrl: gatewayUrl,
                    printGatewayApiKey: apiKey,
                });
            }

            // Test printer connection through gateway
            const result = await testPrinterConnection();

            if (result.data?.success) {
                setTestResult({
                    success: true,
                    message:
                        'Gateway connection successful! Printer is reachable.',
                });
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Gateway connection test passed"
                        type="success"
                    />
                ));
            } else {
                setTestResult({
                    success: false,
                    message:
                        result.error ||
                        'Gateway connection failed. Check if gateway is running and URL is correct.',
                });
            }
        } catch (error: any) {
            setTestResult({
                success: false,
                message:
                    error.message ||
                    'Failed to test gateway connection. Please check your configuration.',
            });
        } finally {
            setIsTesting(false);
        }
    };

    if (isLoading) {
        return <div className="text-sm text-gray-500">Loading settings...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">
                    Wireless Printing Gateway (Optional)
                </h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">
                            ⚠️ Where to Run the Gateway
                        </p>
                        <p className="text-blue-700 mb-2">
                            The gateway{' '}
                            <strong>MUST run on a hotel laptop/computer</strong>{' '}
                            that&apos;s on the{' '}
                            <strong>same network as the printer</strong> (local
                            network).
                        </p>
                        <p className="font-medium mb-1">
                            When do you need a Gateway?
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>
                                <strong>LAN (Same Network):</strong> No gateway
                                needed - works automatically
                            </li>
                            <li>
                                <strong>WAN (Different Network):</strong>{' '}
                                Gateway required to bridge cloud server to local
                                printer
                            </li>
                        </ul>
                        <p className="mt-2 text-blue-700">
                            The system will automatically try direct connection
                            first, then use gateway if needed.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <InputField
                    icon={Network}
                    iconPosition="left"
                    id="gatewayUrl"
                    name="gatewayUrl"
                    label="Gateway URL (Optional)"
                    type="text"
                    placeholder="https://your-gateway.trycloudflare.com or http://192.168.1.100:3001"
                    value={gatewayUrl}
                    onChange={(e) => {
                        setGatewayUrl(e.target.value);
                        setTestResult(null); // Clear test result when URL changes
                    }}
                    className="pl-8 block h-10"
                />

                <InputField
                    icon={Network}
                    iconPosition="left"
                    id="apiKey"
                    name="apiKey"
                    label="Gateway API Key (Optional)"
                    type="password"
                    placeholder="Leave empty if gateway has no authentication"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pl-8 block h-10"
                />

                {testResult && (
                    <div
                        className={`flex items-start gap-2 p-3 rounded-lg ${
                            testResult.success
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                        }`}
                    >
                        {testResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <p
                                className={`text-sm font-medium ${
                                    testResult.success
                                        ? 'text-green-800'
                                        : 'text-red-800'
                                }`}
                            >
                                {testResult.success
                                    ? 'Connection Successful'
                                    : 'Connection Failed'}
                            </p>
                            <p
                                className={`text-xs mt-1 ${
                                    testResult.success
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }`}
                            >
                                {testResult.message}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <BrandButton
                        type="button"
                        onClick={handleTest}
                        disabled={isTesting || !gatewayUrl}
                        className="flex items-center gap-2"
                        icon={<TestTube className="w-4 h-4" />}
                        iconPosition="left"
                        loading={isTesting}
                    >
                        {isTesting ? 'Testing...' : 'Test Connection'}
                    </BrandButton>
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
                </div>
            </div>

            <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Quick Setup Options:
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                    <div>
                        <strong>Option 1: Cloudflare Tunnel (Easiest)</strong>
                        <p className="text-xs text-gray-500 mt-1">
                            <strong>On hotel laptop:</strong> Run{' '}
                            <code className="bg-gray-100 px-1 rounded">
                                cloudflared tunnel --url http://localhost:3001
                            </code>
                            . Copy the URL shown.
                        </p>
                    </div>
                    <div>
                        <strong>Option 2: VPN (Most Secure)</strong>
                        <p className="text-xs text-gray-500 mt-1">
                            Set up VPN between cloud server and hotel network.
                            Use hotel laptop&apos;s local IP like{' '}
                            <code className="bg-gray-100 px-1 rounded">
                                http://192.168.1.100:3001
                            </code>
                            .
                        </p>
                    </div>
                    <div>
                        <strong>Option 3: No Gateway (LAN Only)</strong>
                        <p className="text-xs text-gray-500 mt-1">
                            Leave gateway URL empty if printer is on same
                            network as server. Works automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
