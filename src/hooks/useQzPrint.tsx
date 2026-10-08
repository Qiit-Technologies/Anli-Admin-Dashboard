import qz from 'qz-tray';

interface QZPrintData {
    type: 'raw';
    format: 'command' | 'html' | 'image' | 'pdf';
    flavor: 'base64' | 'file' | 'hex' | 'plain' | 'xml';
    data: string;
    options?: {
        language?: string;
        charset?: string;
    };
}

export async function printWithQZ(
    printDataObject: QZPrintData,
    printerName?: string,
    keepConnectionOpen: boolean = false,
) {
    let connectionEstablished = false;
    try {
        // Connect if not already connected
        if (!qz.websocket.isActive()) {
            // Add timeout for connection
            const connectPromise = qz.websocket.connect();
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout')), 5000),
            );

            await Promise.race([connectPromise, timeoutPromise]);
            connectionEstablished = true;

            // Small delay to ensure connection is fully established
            await new Promise((resolve) => setTimeout(resolve, 150));
        }

        // Verify connection is still active before printing
        if (!qz.websocket.isActive()) {
            throw new Error('QZ Tray connection lost');
        }

        const config = qz.configs.create(printerName || '');

        // Add timeout for print operation (30 seconds should be enough for any print job)
        const printPromise = qz.print(config, [
            {
                type: printDataObject.type,
                format: printDataObject.format,
                flavor: printDataObject.flavor,
                data: printDataObject.data,
                options: printDataObject.options,
            },
        ]);

        const printTimeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Print timeout')), 30000),
        );

        await Promise.race([printPromise, printTimeoutPromise]);

        // Small delay to ensure print job completes before disconnecting
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Only disconnect if we established the connection and keepConnectionOpen is false
        if (!keepConnectionOpen && connectionEstablished) {
            if (qz.websocket.isActive()) {
                try {
                    await qz.websocket.disconnect();
                } catch (disconnectError) {
                    // Ignore disconnect errors - connection might already be closed
                    console.warn('Disconnect warning:', disconnectError);
                }
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error('QZ Tray Print Error:', error);

        // Ensure we disconnect on error if we established the connection
        if (connectionEstablished && qz.websocket.isActive()) {
            try {
                await qz.websocket.disconnect();
            } catch {
                // Ignore disconnect errors
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
