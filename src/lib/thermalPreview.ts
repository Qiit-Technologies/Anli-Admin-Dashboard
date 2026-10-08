import { formatInternalAccountReceiptLines } from './internal-accounts/receipt';

export interface ThermalState {
    alignment: 'left' | 'center' | 'right';
    bold: boolean;
    underline: boolean;
    doubleHeight: boolean;
    fontSize: number;
}

export class ProfessionalReceiptFormatter {
    private static readonly RECEIPT_WIDTH = 32; // Standard 58mm thermal paper character width
    private static readonly WIDE_RECEIPT_WIDTH = 42; // Standard 80mm thermal paper character width

    private static readonly ESC = String.fromCharCode(27);
    private static readonly GS = String.fromCharCode(29);
    private static readonly COMMANDS = {
        INIT: String.fromCharCode(27) + '@',
        ALIGN_LEFT: String.fromCharCode(27) + 'a' + String.fromCharCode(0),
        ALIGN_CENTER: String.fromCharCode(27) + 'a' + String.fromCharCode(1),
        ALIGN_RIGHT: String.fromCharCode(27) + 'a' + String.fromCharCode(2),
        BOLD_ON: String.fromCharCode(27) + 'E' + String.fromCharCode(1),
        BOLD_OFF: String.fromCharCode(27) + 'E' + String.fromCharCode(0),
        UNDERLINE_ON: String.fromCharCode(27) + '-' + String.fromCharCode(1),
        UNDERLINE_OFF: String.fromCharCode(27) + '-' + String.fromCharCode(0),
        DOUBLE_HEIGHT: String.fromCharCode(27) + '!' + String.fromCharCode(16),
        NORMAL_SIZE: String.fromCharCode(27) + '!' + String.fromCharCode(0),
        FEED_LINES: String.fromCharCode(27) + 'd',
        CUT_PAPER: String.fromCharCode(29) + 'V' + String.fromCharCode(1),
    };

    static formatKOT(printData: any): string {
        const width = 32;
        let receipt = this.COMMANDS.INIT;

        receipt +=
            this.COMMANDS.ALIGN_CENTER +
            this.COMMANDS.BOLD_ON +
            this.COMMANDS.DOUBLE_HEIGHT;
        receipt += `${printData.hotel || 'RESTAURANT'}\n`;
        receipt += this.COMMANDS.NORMAL_SIZE + this.COMMANDS.BOLD_OFF;

        if (printData.email) {
            receipt += `${printData.email}\n`;
        }
        if (printData.phone) {
            receipt += `${printData.phone}\n`;
        }
        receipt += this.COMMANDS.ALIGN_LEFT;
        receipt += this.createSeparator('=', width);

        receipt += this.COMMANDS.ALIGN_CENTER + this.COMMANDS.BOLD_ON;
        receipt += 'KITCHEN ORDER TICKET\n';
        receipt += this.COMMANDS.BOLD_OFF + this.COMMANDS.ALIGN_LEFT;
        receipt += this.createSeparator('-', width);

        receipt += `Order #: ${printData.orderId}\n`;
        receipt += `Date: ${this.formatDateTime(printData.orderDate)}\n`;

        if (printData.table?.number) {
            receipt += `Table: ${printData.table.number}\n`;
        }
        if (printData.room) {
            receipt += `Room: ${printData.room}\n`;
        }
        if (printData.waiter?.fullName) {
            receipt += `Waiter: ${printData.waiter.fullName}\n`;
        }
        receipt += this.createSeparator('-', width);

        receipt += this.COMMANDS.BOLD_ON;
        receipt += 'ITEMS:\n';
        receipt += this.COMMANDS.BOLD_OFF;

        printData.items.forEach((item: any, index: number) => {
            if (index > 0) receipt += '\n';

            receipt += `${item.quantity}x ${item.name}\n`;
            if (item.specialInstructions) {
                receipt += `    * ${item.specialInstructions}\n`;
            }
        });

        receipt += this.createSeparator('=', width);
        receipt += this.COMMANDS.ALIGN_CENTER;
        receipt += 'KITCHEN COPY\n';
        receipt += this.COMMANDS.ALIGN_LEFT;

        const kotTakenBy =
            printData.takenBy ||
            printData.waiter?.fullName ||
            printData.orderCreatedBy;
        if (kotTakenBy) {
            receipt += `Taken by: ${kotTakenBy}\n`;
        }

        receipt += `Print time: ${new Date().toLocaleTimeString('en-GB', { hour12: false })}\n`;

        receipt += this.COMMANDS.FEED_LINES + String.fromCharCode(3);
        receipt += this.COMMANDS.CUT_PAPER;

        return receipt;
    }

    static formatBOT(printData: any): string {
        const width = 32;
        let receipt = this.COMMANDS.INIT;

        receipt +=
            this.COMMANDS.ALIGN_CENTER +
            this.COMMANDS.BOLD_ON +
            this.COMMANDS.DOUBLE_HEIGHT;
        receipt += `${printData.hotel || 'RESTAURANT'}\n`;
        receipt += this.COMMANDS.NORMAL_SIZE + this.COMMANDS.BOLD_OFF;

        if (printData.email) {
            receipt += `${printData.email}\n`;
        }
        if (printData.phone) {
            receipt += `${printData.phone}\n`;
        }
        receipt += this.COMMANDS.ALIGN_LEFT;
        receipt += this.createSeparator('=', width);

        receipt += this.COMMANDS.ALIGN_CENTER + this.COMMANDS.BOLD_ON;
        receipt += 'BAR ORDER TICKET\n';
        receipt += this.COMMANDS.BOLD_OFF + this.COMMANDS.ALIGN_LEFT;
        receipt += this.createSeparator('-', width);

        receipt += `Order #: ${printData.orderId}\n`;
        receipt += `Date: ${this.formatDateTime(printData.orderDate)}\n`;

        if (printData.table?.number) {
            receipt += `Table: ${printData.table.number}\n`;
        }
        if (printData.room) {
            receipt += `Room: ${printData.room}\n`;
        }
        if (printData.waiter?.fullName) {
            receipt += `Waiter: ${printData.waiter.fullName}\n`;
        }
        receipt += this.createSeparator('-', width);

        receipt += this.COMMANDS.BOLD_ON;
        receipt += 'DRINKS:\n';
        receipt += this.COMMANDS.BOLD_OFF;

        printData.items.forEach((item: any, index: number) => {
            if (index > 0) receipt += '\n';

            receipt += `${item.quantity}x ${item.name}\n`;
            if (item.specialInstructions) {
                receipt += `    * ${item.specialInstructions}\n`;
            }
        });

        receipt += this.createSeparator('=', width);
        receipt += this.COMMANDS.ALIGN_CENTER;
        receipt += 'BAR COPY\n';
        receipt += this.COMMANDS.ALIGN_LEFT;

        const botTakenBy =
            printData.takenBy ||
            printData.waiter?.fullName ||
            printData.orderCreatedBy;
        if (botTakenBy) {
            receipt += `Taken by: ${botTakenBy}\n`;
        }

        receipt += `Print time: ${new Date().toLocaleTimeString('en-GB', { hour12: false })}\n`;

        receipt += this.COMMANDS.FEED_LINES + String.fromCharCode(3);
        receipt += this.COMMANDS.CUT_PAPER;

        return receipt;
    }

    static formatProfessionalReceipt(printData: any): string {
        const width = this.WIDE_RECEIPT_WIDTH;
        let receipt = this.COMMANDS.INIT;

        receipt += this.COMMANDS.ALIGN_CENTER + this.COMMANDS.BOLD_ON;
        receipt += `${printData.hotel || 'RESTAURANT'}\n`;
        receipt += this.COMMANDS.BOLD_OFF;

        if (printData.email) {
            receipt += `${printData.email}\n`;
        }
        if (printData.phone) {
            receipt += `${printData.phone}\n`;
        }
        receipt += this.COMMANDS.ALIGN_LEFT;
        receipt += this.createSeparator('=', width);

        receipt += this.COMMANDS.ALIGN_CENTER + this.COMMANDS.BOLD_ON;
        receipt += 'RECEIPT\n';
        receipt += this.COMMANDS.BOLD_OFF + this.COMMANDS.ALIGN_LEFT;
        receipt += this.createSeparator('-', width);

        receipt += `Order #: ${printData.orderId}\n`;
        receipt += `Date: ${this.formatDateTime(printData.orderDate)}\n`;

        if (printData.table?.number) {
            receipt += `Table: ${printData.table.number}\n`;
        }
        if (printData.room) {
            receipt += `Room: ${printData.room}\n`;
        }
        if (printData.waiter?.fullName) {
            receipt += `Waiter: ${printData.waiter.fullName}\n`;
        }
        const badge = String(printData.paymentStatusBadge || '').toUpperCase();
        const allocations = printData.paymentAllocations ?? [];
        if (badge === 'SETTLED' || (badge === 'PAID' && allocations.length > 0)) {
            receipt += this.createSeparator('-', width);
            receipt +=
                this.COMMANDS.BOLD_ON +
                'SETTLEMENT DETAILS\n' +
                this.COMMANDS.BOLD_OFF;
            if (printData.settlementAt) {
                receipt += `Date: ${this.formatDateTime(printData.settlementAt)}\n`;
            }
            if (printData.settlementCashier) {
                receipt += `Cashier: ${printData.settlementCashier}\n`;
            }
            if (printData.settlementReference) {
                receipt += `Settlement Ref: ${printData.settlementReference}\n`;
            }
            if (allocations.length > 0) {
                allocations.forEach((payment: any, index: number) => {
                    const method = String(payment.paymentMethod || 'Payment')
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c: string) => c.toUpperCase());
                    receipt += `${index + 1}. ${method}: NGN ${Number(payment.amount || 0).toLocaleString('en-NG')}\n`;
                    if (payment.receivingAccount) {
                        receipt += `   Acct: ${payment.receivingAccount}\n`;
                    }
                    if (payment.transactionReference) {
                        receipt += `   Ref: ${payment.transactionReference}\n`;
                    }
                    if (payment.remarks) {
                        receipt += `   Note: ${payment.remarks}\n`;
                    }
                });
            } else {
                for (const line of formatInternalAccountReceiptLines({
                    paymentMethod: printData.paymentMethod,
                    receivingAccount: printData.receivingAccount,
                })) {
                    receipt += `${line}\n`;
                }
            }
            if (badge === 'SETTLED') {
                receipt += 'Status: Fully Settled\n';
            }
        } else {
            for (const line of formatInternalAccountReceiptLines({
                paymentMethod: printData.paymentMethod,
                receivingAccount: printData.receivingAccount,
            })) {
                receipt += `${line}\n`;
            }
        }
        receipt += this.createSeparator('-', width);

        printData.items.forEach((item: any) => {
            const itemTotal = item.quantity * item.price;
            const totalStr = `NGN ${Math.round(itemTotal)}`;
            const left = `${item.quantity}x ${item.name}`.trim();
            const maxLeft = width - totalStr.length - 1;
            if (left.length <= maxLeft) {
                receipt += `${left}${' '.repeat(Math.max(1, width - left.length - totalStr.length))}${totalStr}\n`;
            } else {
                receipt += `${left.slice(0, maxLeft)}\n${' '.repeat(Math.max(0, width - totalStr.length))}${totalStr}\n`;
            }
            if (item.specialInstructions) {
                receipt += `  ${item.specialInstructions}\n`;
            }
        });

        receipt += this.createSeparator('-', width);

        receipt += this.formatSummaryLine(
            'Subtotal',
            printData.billAmount,
            width,
        );

        const vatNum = Number(printData.vat);
        if (!isNaN(vatNum) && vatNum > 0) {
            const vatLabel = printData.vatRate
                ? `VAT (${Number(printData.vatRate).toFixed(1)}%)`
                : 'VAT';
            receipt += this.formatSummaryLine(vatLabel, vatNum, width);
        }

        const serviceChargeNum = Number(printData.serviceCharge);
        if (!isNaN(serviceChargeNum) && serviceChargeNum > 0) {
            const scLabel = printData.serviceChargeRate
                ? `Service Charge (${Number(printData.serviceChargeRate).toFixed(0)}%)`
                : 'Service Charge';
            receipt += this.formatSummaryLine(scLabel, serviceChargeNum, width);
        }

        const tipNum = Number(printData.tip);
        if (!isNaN(tipNum) && tipNum > 0) {
            const tipLabel = printData.tipRate
                ? `Tip (${Number(printData.tipRate).toFixed(0)}%)`
                : 'Tip';
            receipt += this.formatSummaryLine(tipLabel, tipNum, width);
        }

        const customCharges = printData.customCharges ?? [];
        for (const charge of customCharges) {
            const amount = Number(charge.amount);
            if (isNaN(amount) || amount <= 0) continue;

            const hasRate =
                typeof charge.rate === 'number' && !isNaN(Number(charge.rate));
            const label = hasRate
                ? `${charge.name} (${Number(charge.rate).toFixed(1)}%)`
                : charge.name;

            receipt += this.formatSummaryLine(label, amount, width);
        }

        if (
            printData.totalTax &&
            printData.totalTax !== '' &&
            printData.totalTax !== printData.vat
        ) {
            receipt += this.formatSummaryLine(
                'Tax',
                Number(printData.totalTax),
                width,
            );
        }

        receipt += this.createSeparator('-', width);

        receipt += this.COMMANDS.BOLD_ON;
        receipt += this.formatSummaryLine('TOTAL', printData.total, width);
        receipt += this.COMMANDS.BOLD_OFF;

        const complimentaryAmount = Number(printData.complimentaryAmount ?? 0);
        if (!isNaN(complimentaryAmount) && complimentaryAmount > 0.009) {
            receipt += this.formatSummaryLine(
                'Complimentary',
                -complimentaryAmount,
                width,
            );
            receipt += this.COMMANDS.BOLD_ON;
            receipt += this.formatSummaryLine(
                'AMOUNT DUE',
                Number(printData.amountDue ?? 0),
                width,
            );
            receipt += this.COMMANDS.BOLD_OFF;
        }

        receipt += this.createSeparator('=', width);

        receipt += this.COMMANDS.ALIGN_CENTER;
        receipt += 'Thank you for your visit!\n';
        receipt += 'Please come again\n';
        receipt += this.COMMANDS.ALIGN_LEFT;

        const receiptTakenBy =
            printData.takenBy ||
            printData.waiter?.fullName ||
            printData.orderCreatedBy;
        if (receiptTakenBy) {
            receipt += `\nTaken by: ${receiptTakenBy}\n`;
        }

        receipt += `Print time: ${new Date().toLocaleString('en-GB')}\n`;

        receipt += this.COMMANDS.FEED_LINES + String.fromCharCode(3);
        receipt += this.COMMANDS.CUT_PAPER;

        return receipt;
    }

    private static createSeparator(char: string, width: number): string {
        return char.repeat(width) + '\n';
    }

    private static formatDateTime(orderDate: Date | string): string {
        const date =
            typeof orderDate === 'string' ? new Date(orderDate) : orderDate;

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    private static formatItemLine(
        qty: number,
        price: number,
        total: number,
        width: number,
    ): string {
        const priceStr = `₦${Math.round(price)}`;
        const totalStr = `₦${Math.round(total)}`;
        const spaces = width - priceStr.length - totalStr.length;
        return `${priceStr}${' '.repeat(Math.max(1, spaces))}${totalStr}\n`;
    }

    private static formatSummaryLine(
        label: string,
        amount: number,
        width: number,
    ): string {
        const amountStr = `₦${Math.round(amount)}`;
        const spaces = width - label.length - amountStr.length;
        return `${label}${' '.repeat(Math.max(1, spaces))}${amountStr}\n`;
    }
}

export function createThermalPreview(escPosData: string): string {
    const ESC = String.fromCharCode(27);
    // const GS = String.fromCharCode(29);

    let html = '';
    let currentState: ThermalState = {
        alignment: 'left',
        bold: false,
        underline: false,
        doubleHeight: false,
        fontSize: 12,
    };

    const segments = escPosData.split(ESC);

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (i === 0) {
            html += processTextSegment(segment, currentState);
            continue;
        }

        if (segment.length === 0) continue;

        const command = segment[0];
        const params = segment.slice(1);

        switch (command) {
            case '@':
                currentState = {
                    alignment: 'left',
                    bold: false,
                    underline: false,
                    doubleHeight: false,
                    fontSize: 12,
                };
                html += processTextSegment(params, currentState);
                break;

            case 'a':
                if (params.length > 0) {
                    const alignCode = params.charCodeAt(0);
                    currentState.alignment =
                        alignCode === 1
                            ? 'center'
                            : alignCode === 2
                              ? 'right'
                              : 'left';
                }
                html += processTextSegment(params.slice(1), currentState);
                break;

            case 'E':
                if (params.length > 0) {
                    currentState.bold = params.charCodeAt(0) === 1;
                }
                html += processTextSegment(params.slice(1), currentState);
                break;

            case '-':
                if (params.length > 0) {
                    currentState.underline = params.charCodeAt(0) === 1;
                }
                html += processTextSegment(params.slice(1), currentState);
                break;

            case '!':
                if (params.length > 0) {
                    const sizeCode = params.charCodeAt(0);
                    currentState.doubleHeight = (sizeCode & 16) !== 0;
                    currentState.fontSize = currentState.doubleHeight ? 18 : 12;
                }
                html += processTextSegment(params.slice(1), currentState);
                break;

            default:
                html += processTextSegment(segment, currentState);
                break;
        }
    }

    return html;
}

function processTextSegment(text: string, state: ThermalState): string {
    if (!text) return '';

    const processedText = text
        .replace(/\n/g, '<br>')
        .replace(/\r/g, '')
        .replace(/\t/g, '    ');

    const styles: string[] = [];

    if (state.bold) styles.push('font-weight: bold');
    if (state.underline) styles.push('text-decoration: underline');
    if (state.doubleHeight) {
        styles.push('font-size: 18px');
        styles.push('line-height: 1.1');
        styles.push('font-weight: bold');
    }

    let alignClass = '';
    switch (state.alignment) {
        case 'center':
            alignClass = 'text-align: center';
            break;
        case 'right':
            alignClass = 'text-align: right';
            break;
        default:
            alignClass = 'text-align: left';
            break;
    }

    styles.push(alignClass);

    const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';

    return `<div${styleAttr}>${processedText}</div>`;
}

export function createThermalPreviewHTML(escPosData: string): string {
    const formattedContent = createThermalPreview(escPosData);

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Professional Thermal Receipt Preview</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Courier New', 'Monaco', 'Menlo', monospace; 
            font-size: 12px; 
            line-height: 1.2; 
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
          }
          
          .receipt-container {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: calc(100vh - 40px);
            padding: 20px 0;
          }
          
          .receipt-wrapper {
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 400px;
          }
          
          .receipt-header {
            background: #2c3e50;
            color: white;
            padding: 15px;
            text-align: center;
          }
          
          .receipt-header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
          }
          
          .receipt-info {
            background: #ecf0f1;
            padding: 10px 15px;
            font-size: 11px;
            color: #7f8c8d;
            border-bottom: 1px solid #bdc3c7;
          }
          
          .receipt { 
            width: 280px; 
            background: white; 
            padding: 20px 15px; 
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.3;
            color: #2c3e50;
            white-space: pre-line;
            word-wrap: break-word;
            border: 2px dashed #bdc3c7;
            margin: 0;
          }
          
          .receipt div {
            margin: 0;
            padding: 1px 0;
          }
          
          .receipt-footer {
            background: #ecf0f1;
            padding: 15px;
            text-align: center;
            font-size: 11px;
            color: #7f8c8d;
          }
          
          .preview-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #e74c3c;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .receipt-container {
              padding: 0;
            }
            
            .receipt-wrapper {
              box-shadow: none;
              border-radius: 0;
            }
            
            .preview-badge {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="preview-badge">PREVIEW</div>
        <div class="receipt-container">
          <div class="receipt-wrapper">
            <div class="receipt-header">
              <h2>🧾 Thermal Receipt Preview</h2>
            </div>
            <div class="receipt-info">
              📏 Width: 280px (58mm thermal paper)<br>
              🖨️ Font: Courier New (monospace)<br>
              ⚡ ESC/POS Compatible Format
            </div>
            <div class="receipt">${formattedContent}</div>
            <div class="receipt-footer">
              Professional thermal receipt layout based on industry standards<br>
              Compatible with 58mm and 80mm thermal printers
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
