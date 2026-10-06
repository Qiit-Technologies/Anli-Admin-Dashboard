# Multi-Printer Configuration for QZ Tray

## Problem Solved

Previously, when using QZ Tray for printing, you could only select ONE printer for all print types (KOT, BOT, and Receipts). This meant:

- Kitchen orders (KOT) would go to the wrong printer
- Bar orders (BOT) would go to the wrong printer
- You had to manually change printer selection each time

**Now you can configure different printers for each print type - NO GATEWAY NEEDED!**

## Solution

The new `MultiPrinterConfig` component allows you to:

- Set a **Kitchen Printer** for KOT (Kitchen Order Tickets)
- Set a **Bar Printer** for BOT (Bar Order Tickets)
- Set a **Receipt Printer** for customer receipts
- All printing happens locally through QZ Tray (no backend gateway required)

## How to Use

### 1. Add the Component to Your Settings/Printer Page

```tsx
import { MultiPrinterConfig } from '@/components/MultiPrinterConfig';

export default function PrinterSetupPage() {
    return (
        <div>
            <h1>Printer Configuration</h1>

            {/* Multi-Printer Configuration */}
            <MultiPrinterConfig />

            {/* Other printer settings... */}
        </div>
    );
}
```

### 2. Or Add to Settings Modal

```tsx
import { MultiPrinterConfig } from '@/components/MultiPrinterConfig';

export function SettingsModal() {
    return (
        <Dialog>
            <DialogContent>
                <Tabs>
                    <TabsContent value="printers">
                        <MultiPrinterConfig />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
```

### 3. Configure Your Printers

1. Open the printer configuration page
2. Select your Kitchen Printer for KOT
3. Select your Bar Printer for BOT
4. Select your Receipt Printer for customer receipts
5. Click "Save Configuration"

### 4. That's It!

Now when you print:

- **KOT** → Goes to Kitchen Printer
- **BOT** → Goes to Bar Printer
- **Receipt** → Goes to Receipt Printer

All routing happens automatically in the frontend using the configuration you saved.

## Features

✅ **No Gateway Required** - Works completely locally through QZ Tray  
✅ **Automatic Routing** - Each print type goes to the correct printer  
✅ **Fallback Support** - If not configured, uses system default  
✅ **Backward Compatible** - Still works with old single-printer setup  
✅ **Easy Configuration** - Simple dropdown interface

## Technical Details

The configuration is stored in `localStorage` as:

```json
{
    "kot": "Kitchen Thermal Printer",
    "bot": "Bar Thermal Printer",
    "receipt": "Front Desk Printer"
}
```

### Files Modified/Created:

1. **`/components/MultiPrinterConfig.tsx`** - UI component for configuration
2. **`/lib/printerConfig.ts`** - Utility functions for getting printer by type
3. **`/lib/simplePrint.ts`** - Updated to use configured printers

### How It Works:

When you call `printOrderKOT()`, `printOrderBOT()`, or `printOrderReceipt()`:

1. System checks `printerConfig` in localStorage
2. Gets the appropriate printer for that print type
3. Sends job to that specific printer via QZ Tray
4. Falls back to `printerName` (old config) if not set
5. Falls back to system default if nothing is configured

## Troubleshooting

### QZ Tray Not Available

- Make sure QZ Tray is installed and running
- Check that QZ Tray has permission in your browser
- Try the "Retry Connection" button

### Printer Not Showing Up

- Ensure the printer is installed on the system
- Check printer drivers are up to date
- Click "Refresh" to reload printer list

### Print Going to Wrong Printer

- Verify configuration is saved (you should see "✓ Saved")
- Check that you selected the correct printer for each type
- Try clearing browser cache and reconfiguring

## Example Use Cases

### Restaurant with Separate Kitchen and Bar

```
KOT → "Epson TM-T88VI Kitchen"
BOT → "Epson TM-T88VI Bar"
Receipt → "HP LaserJet Front Desk"
```

### Small Café (Same Printer for All)

```
KOT → "Star TSP143III"
BOT → "Star TSP143III"
Receipt → "Star TSP143III"
```

Just click "Use Same for All" button!

## Migration from Old System

If you were using the old single-printer selector:

1. Your existing `printerName` will be used as fallback
2. Configure multi-printer setup when ready
3. Old setup will continue working until you configure new one
4. No data loss or interruption

## Need Help?

If you're still having issues after configuring:

1. Check browser console for errors
2. Verify QZ Tray is running (system tray icon)
3. Test printing from QZ Tray directly
4. Check that printers are not paused/offline in system settings
