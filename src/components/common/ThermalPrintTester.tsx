'use client';

import { previewReceipt } from '@/lib/simplePrint';
import { useState } from 'react';

// Sample receipt data for testing
const sampleReceiptData = `\x1b@\x1ba\x01\x1bE\x01\x1b!\x10ORION HOTEL\n\x1b!\x00\x1bE\x00info@orionhotel.com\n+234-123-456-7890\n\x1ba\x00================================\n\x1ba\x01\x1bE\x01RECEIPT\n\x1bE\x00\x1ba\x00--------------------------------\nOrder #: 12345\nDate: 15/01/2024 14:30\nTable: 5\nWaiter: John Doe\nPayment: Cash\n--------------------------------\n2x Jollof Rice\n₦2,500.00 x 2 = ₦5,000.00\n1x Grilled Chicken\n₦3,500.00 x 1 = ₦3,500.00\n3x Coca Cola\n₦500.00 x 3 = ₦1,500.00\n   Note: Extra ice\n--------------------------------\nSubtotal                ₦10,000.00\nVAT (7.5%)                ₦750.00\n--------------------------------\n\x1bE\x01TOTAL                   ₦10,750.00\x1bE\x00\n================================\n\x1ba\x01Thank you for your visit!\nPrinted by: Jane Smith\n\x1bd\x03\x1dV\x01`;

const sampleKOTData = `\x1b@\x1ba\x01\x1bE\x01\x1b!\x10ORION HOTEL\n\x1b!\x00\x1bE\x00info@orionhotel.com\n+234-123-456-7890\n\x1ba\x00================================\n\x1ba\x01\x1bE\x01KITCHEN ORDER TICKET\n\x1bE\x00\x1ba\x00--------------------------------\nOrder #: 12345\nDate: 15/01/2024 14:30\nTable: 5\nWaiter: John Doe\n--------------------------------\n2x Jollof Rice\n1x Grilled Chicken\n   Note: Well done\n3x Fried Plantain\n================================\nPrinted by: Kitchen Staff\n\x1bd\x03\x1dV\x01`;

const sampleBOTData = `\x1b@\x1ba\x01\x1bE\x01\x1b!\x10ORION HOTEL\n\x1b!\x00\x1bE\x00info@orionhotel.com\n+234-123-456-7890\n\x1ba\x00================================\n\x1ba\x01\x1bE\x01BAR ORDER TICKET\n\x1bE\x00\x1ba\x00--------------------------------\nOrder #: 12345\nDate: 15/01/2024 14:30\nTable: 5\nWaiter: John Doe\n--------------------------------\n3x Coca Cola\n   Note: Extra ice\n2x Chapman\n1x Star Beer\n================================\nPrinted by: Bar Staff\n\x1bd\x03\x1dV\x01`;

export function ThermalPrintTester() {
    const [selectedType, setSelectedType] = useState<'receipt' | 'kot' | 'bot'>(
        'receipt',
    );
    const [customData, setCustomData] = useState('');
    const [useCustomData, setUseCustomData] = useState(false);

    const getSampleData = () => {
        switch (selectedType) {
            case 'kot':
                return sampleKOTData;
            case 'bot':
                return sampleBOTData;
            default:
                return sampleReceiptData;
        }
    };

    const handlePreview = () => {
        const dataToPreview = useCustomData ? customData : getSampleData();
        previewReceipt(dataToPreview);
    };

    const handleClearCustomData = () => {
        setCustomData('');
        setUseCustomData(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Thermal Print Tester
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Print Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) =>
                                setSelectedType(
                                    e.target.value as 'receipt' | 'kot' | 'bot',
                                )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={useCustomData}
                        >
                            <option value="receipt">Receipt</option>
                            <option value="kot">
                                Kitchen Order Ticket (KOT)
                            </option>
                            <option value="bot">Bar Order Ticket (BOT)</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="useCustomData"
                            checked={useCustomData}
                            onChange={(e) => setUseCustomData(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="useCustomData"
                            className="text-sm font-medium text-gray-700"
                        >
                            Use custom data
                        </label>
                    </div>

                    {useCustomData && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Receipt Data (with ESC/POS commands)
                            </label>
                            <textarea
                                value={customData}
                                onChange={(e) => setCustomData(e.target.value)}
                                placeholder="Paste your receipt data here..."
                                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                            />
                            <button
                                onClick={handleClearCustomData}
                                className="mt-2 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Clear & Use Sample
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handlePreview}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        🖨️ Preview {selectedType.toUpperCase()}
                    </button>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <h3 className="font-medium text-yellow-800 mb-2">
                            How to use:
                        </h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>
                                • Select a print type to test with sample data
                            </li>
                            <li>
                                {` • Or check "Use custom data" to test your own
                                receipt data`}
                            </li>
                            <li>
                                {` • Click "Preview" to open a popup window showing
                                how it will look`}
                            </li>
                            <li>
                                • The preview removes ESC/POS commands to show
                                readable text
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">
                        Sample Data Preview:
                    </h3>
                    <div className="bg-white border rounded p-3 font-mono text-xs overflow-auto max-h-96">
                        <pre className="whitespace-pre-wrap">
                            {useCustomData
                                ? customData ||
                                  'Enter custom data to preview...'
                                : getSampleData().replace(
                                      '/[\u0000-\u001F\u007F-\u009F]/g',
                                      (match) => {
                                          // Show some ESC/POS commands for reference
                                          const code = match.charCodeAt(0);
                                          if (code === 27) return '[ESC]';
                                          if (code === 29) return '[GS]';
                                          return `[${code.toString(16).toUpperCase()}]`;
                                      },
                                  )}
                        </pre>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-800 mb-2">
                    ESC/POS Command Reference:
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                        <strong>Alignment:</strong>
                        <ul className="ml-4 mt-1">
                            <li>• \x1ba\x00 = Left align</li>
                            <li>• \x1ba\x01 = Center align</li>
                            <li>• \x1ba\x02 = Right align</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Text Style:</strong>
                        <ul className="ml-4 mt-1">
                            <li>• \x1bE\x01 = Bold ON</li>
                            <li>• \x1bE\x00 = Bold OFF</li>
                            <li>• \x1b!\x10 = Double height</li>
                            <li>• \x1b!\x00 = Normal size</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
