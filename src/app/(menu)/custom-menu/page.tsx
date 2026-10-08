import { QrCode } from 'lucide-react';

export default function CustomMenuRootPage() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-100 px-6 text-center">
            <div className="mb-6 rounded-full bg-neutral-200 p-6">
                <QrCode className="h-16 w-16 text-neutral-500" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-neutral-800">
                Digital Menu
            </h1>
            <p className="mb-8 max-w-sm text-neutral-600">
                Scan the QR code at your table to view the menu for this
                restaurant.
            </p>
            <p className="text-sm text-neutral-500">
                No QR code? Ask your server for the menu link.
            </p>
        </div>
    );
}
