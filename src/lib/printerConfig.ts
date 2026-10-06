/**
 * Printer configuration utility for QZ Tray multi-printer setup
 */

interface PrinterConfig {
    kot: string;
    bot: string;
    receipt: string;
}

/**
 * Get the configured printer name for a specific print type
 * @param printType - The type of print job (kot, bot, or receipt)
 * @returns The printer name to use, or undefined for system default
 */
export function getPrinterForType(
    printType: 'kot' | 'bot' | 'receipt',
): string | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    try {
        // Try to get multi-printer configuration
        const configStr = localStorage.getItem('printerConfig');
        if (configStr) {
            const config: PrinterConfig = JSON.parse(configStr);
            const printer = config[printType];
            if (printer && printer.trim() !== '') {
                return printer;
            }
        }
    } catch (e) {
        console.warn('Failed to parse printer config:', e);
    }

    // Fallback to single printer configuration (backward compatibility)
    const singlePrinter = localStorage.getItem('printerName');
    if (singlePrinter && singlePrinter.trim() !== '') {
        return singlePrinter;
    }

    // Return undefined to use system default
    return undefined;
}

/**
 * Get all configured printers
 */
export function getAllPrinterConfig(): PrinterConfig | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const configStr = localStorage.getItem('printerConfig');
        if (configStr) {
            return JSON.parse(configStr);
        }
    } catch (e) {
        console.warn('Failed to parse printer config:', e);
    }

    return null;
}

/**
 * Check if multi-printer configuration is set up
 */
export function hasMultiPrinterConfig(): boolean {
    const config = getAllPrinterConfig();
    if (!config) return false;

    // Check if at least one printer is configured
    return (
        (!!config.kot && config.kot.trim() !== '') ||
        (!!config.bot && config.bot.trim() !== '') ||
        (!!config.receipt && config.receipt.trim() !== '')
    );
}

/**
 * Save printer configuration
 */
export function savePrinterConfig(config: PrinterConfig): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem('printerConfig', JSON.stringify(config));

    // Also save receipt printer as main printer for backward compatibility
    if (config.receipt) {
        localStorage.setItem('printerName', config.receipt);
    }
}
