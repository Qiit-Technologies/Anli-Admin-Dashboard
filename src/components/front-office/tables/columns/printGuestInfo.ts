import { getGuestInfoById, getGuestServices } from '@/app/actions/guest';
import { fetchHotelById } from '@/app/actions/hotel';
import { formatCurrency } from '@/lib/utils';

export async function printGuestPaymentInfo(guestId: number) {
    try {
        // Fetch guest information
        const guestInfoResult = await getGuestInfoById(String(guestId));
        if (guestInfoResult?.error || !guestInfoResult?.data) {
            alert('Failed to fetch guest information. Please try again.');
            return;
        }

        const guestData = guestInfoResult.data.stay[0];
        if (!guestData) {
            alert('Guest data not found.');
            return;
        }

        // Fetch hotel information
        const hotelResult = await fetchHotelById();
        const hotel = hotelResult?.data || null;

        // Fetch guest services
        const servicesResult = await getGuestServices(String(guestId));
        const services = servicesResult?.data || [];

        // Calculate totals
        const isServicePaidStatus = (status: any) => {
            const st = String(status || '').toUpperCase();
            return st === 'PAID' || st === 'COMPLETED' || st === 'BILL_SETTLED_FROM_FRONT_DESK';
        };

        const unpaidServicesTotal =
            services
                ?.filter((service: any) => !isServicePaidStatus(service.paymentStatus))
                ?.reduce(
                    (sum: number, service: any) => sum + Number(service.amount || service.amountPaid || 0),
                    0,
                ) || 0;

        const paidServicesTotal =
            services
                ?.filter((service: any) => isServicePaidStatus(service.paymentStatus))
                ?.reduce(
                    (sum: number, service: any) => sum + Number(service.amount || service.amountPaid || 0),
                    0,
                ) || 0;

        // Format dates
        const checkInDate = guestData.startDate
            ? new Date(guestData.startDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : 'N/A';
        const checkInTime = guestData.startTime
            ? new Date(`1970-01-01T${guestData.startTime}`).toLocaleTimeString(
                'en-US',
                {
                    hour: '2-digit',
                    minute: '2-digit',
                },
            )
            : 'N/A';
        const checkOutDate = guestData.endDate
            ? new Date(guestData.endDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : 'N/A';

        // Get reservation type
        const getReservationType = () => {
            if (guestData.isVoid) return 'Void';
            if (guestData.isComplimentary) return 'Complimentary';
            if (guestData.isDiscounted) return 'Discounted';
            return 'Regular';
        };

        const reservationType = getReservationType();

        // Calculate nights stayed (used for display)
        const checkInDateObj = new Date(guestData.startDate);
        const checkOutDateObj = guestData.endDate
            ? new Date(guestData.endDate)
            : new Date();
        const nightsStayed = Math.ceil(
            (checkOutDateObj.getTime() - checkInDateObj.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Calculate room charges based on reservation type
        const roomRate = guestData.rebateRate
            ? Number(guestData.rebateRate)
            : Number(guestData.room?.price || 0);
        const totalRoomCharge = roomRate * nightsStayed;

        let roomCharge = 0;

        if (guestData.isVoid) {
            roomCharge = 0;
        } else if (guestData.isComplimentary) {
            roomCharge = 0;
        } else if (guestData.isDiscounted) {
            // For discounted, use finalPrice (already has discount applied)
            roomCharge = Number(guestData.finalPrice || 0);
        } else {
            // For regular reservations, use finalPrice if available, otherwise use calculated total
            if (
                guestData.finalPrice !== undefined &&
                guestData.finalPrice !== null
            ) {
                roomCharge = Number(guestData.finalPrice);
            } else {
                roomCharge = totalRoomCharge;
            }
        }

        const totalServicesAmount = services.reduce(
            (sum: number, s: any) => sum + (s.amount || s.amountPaid || 0),
            0,
        );

        const vatRate = Number(guestData.vatRateSnapshot || 0);
        const serviceChargeRate = Number(guestData.serviceChargeRateSnapshot || 0);
        const tipRate = Number(guestData.tipRateSnapshot || 0);
        const chargeBase = roomCharge;

        const vatAmount = (chargeBase * vatRate) / 100;
        const serviceChargeAmount = (chargeBase * serviceChargeRate) / 100;
        const tipAmount = (chargeBase * tipRate) / 100;

        // A waived charge is not billed, so it is left off the receipt entirely
        // rather than printed and then credited back on a separate line.
        const waivedCharges = guestData.waivedCharges;
        const vatWaived = Boolean(waivedCharges?.vat);
        const serviceChargeWaived = Boolean(waivedCharges?.serviceCharge);
        const tipWaived = Boolean(waivedCharges?.tip);

        const hasWaiver =
            vatWaived ||
            serviceChargeWaived ||
            tipWaived ||
            Boolean(waivedCharges?.customCharges);

        const grandTotal = hasWaiver
            ? Number(guestData.totalWithCustomCharges || roomCharge + totalServicesAmount)
            : roomCharge + totalServicesAmount;
        const totalPaid = (guestData.amountPaid || 0) + paidServicesTotal;
        const totalOutstanding = grandTotal - totalPaid;

        // Build HTML content
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Guest Payment Information - ${guestData.fullName}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #f59e0b;
            padding: 30px 20px;
            margin-bottom: 30px;
        }
        .hotel-logo {
            max-width: 120px;
            max-height: 120px;
            margin: 0 auto 15px;
            border-radius: 8px;
            object-fit: contain;
        }
        .hotel-logo-placeholder {
            width: 120px;
            height: 120px;
            margin: 0 auto 15px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 48px;
            font-weight: 700;
        }
        .header h1 {
            font-size: 32px;
            color: #92400e;
            margin-bottom: 8px;
            font-weight: 700;
        }
        .header .subtitle {
            color: #78350f;
            font-size: 18px;
            font-weight: 500;
        }
        .header .address {
            color: #92400e;
            font-size: 14px;
            margin-top: 8px;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
            border-bottom: 2px solid #fbbf24;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        .info-item {
            display: flex;
            flex-direction: column;
        }
        .info-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 15px;
            font-weight: 500;
            color: #1e293b;
        }
        .table-container {
            margin-top: 15px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #475569;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            color: #1e293b;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .badge-void {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .badge-complimentary {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .badge-discounted {
            background-color: #fed7aa;
            color: #9a3412;
        }
        .badge-regular {
            background-color: #dcfce7;
            color: #166534;
        }
        .summary-box {
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .summary-row:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 16px;
            padding-top: 12px;
            margin-top: 8px;
            border-top: 2px solid #f59e0b;
        }
        .grand-total-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 3px solid #f59e0b;
            border-radius: 12px;
            padding: 25px;
            margin-top: 30px;
            box-shadow: 0 4px 6px rgba(217, 119, 6, 0.1);
        }
        .grand-total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            font-size: 20px;
            font-weight: 700;
            color: #92400e;
            border-top: 2px solid #f59e0b;
            margin-top: 12px;
            padding-top: 16px;
        }
        .grand-total-label {
            font-size: 22px;
            color: #78350f;
        }
        .grand-total-value {
            font-size: 28px;
            color: #92400e;
        }
        .summary-label {
            color: #64748b;
        }
        .summary-value {
            color: #1e293b;
            font-weight: 500;
        }
        .total-row {
            color: #1e40af;
            font-size: 18px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        @media print {
            body {
                padding: 0;
            }
            .section {
                page-break-inside: avoid;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${hotel?.coverImage
                ? `
                <img src="${hotel.coverImage}" alt="${hotel?.name || 'Hotel'} Logo" class="hotel-logo" />
            `
                : `
                <div class="hotel-logo-placeholder">
                    ${hotel?.name ? hotel.name.charAt(0).toUpperCase() : 'H'}
                </div>
            `
            }
            <h1>${hotel?.name || 'Hotel'}</h1>
            <div class="subtitle">Guest Payment Information</div>
            ${hotel?.address
                ? `
                <div class="address">${hotel.address}</div>
            `
                : ''
            }
        </div>

        <!-- Guest Information Section -->
        <div class="section">
            <div class="section-title">Guest Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Guest Name</div>
                    <div class="info-value">${guestData.fullName || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Guest ID</div>
                    <div class="info-value">#GUEST-${guestData.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${guestData.email || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone Number</div>
                    <div class="info-value">${guestData.phoneNumber || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Reservation Type</div>
                    <div class="info-value">
                        <span class="badge badge-${reservationType.toLowerCase()}">${reservationType}</span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                        ${guestData.isCheckedIn ? 'Checked In' : guestData.isCheckedOut ? 'Checked Out' : 'Reserved'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Stay Information Section -->
        <div class="section">
            <div class="section-title">Stay Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Check-In Date</div>
                    <div class="info-value">${checkInDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Check-In Time</div>
                    <div class="info-value">${checkInTime}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Check-Out Date</div>
                    <div class="info-value">${checkOutDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Number of Nights</div>
                    <div class="info-value">${nightsStayed}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Room Number</div>
                    <div class="info-value">${guestData.room?.roomNumber || guestData.roomNumber || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Room Type</div>
                    <div class="info-value">${guestData.roomType?.name || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Number of Guests</div>
                    <div class="info-value">${guestData.numberOfGuests || 1}</div>
                </div>
                ${guestData.secondGuestFullName
                ? `
                <div class="info-item">
                    <div class="info-label">Second Guest</div>
                    <div class="info-value">${guestData.secondGuestFullName} (${guestData.secondGuestType || 'adult'})</div>
                </div>
                `
                : ''
            }
            </div>
        </div>

        <!-- Payment Information Section -->
        <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="summary-box">
                ${guestData.isVoid
                ? `
                    <div class="summary-row">
                        <span class="summary-label">Reservation Type:</span>
                        <span class="summary-value">Void</span>
                    </div>
                    ${guestData.voidReason
                    ? `
                    <div class="summary-row">
                        <span class="summary-label">Void Reason:</span>
                        <span class="summary-value">${guestData.voidReason}</span>
                    </div>
                    `
                    : ''
                }
                    <div class="summary-row">
                        <span class="summary-label">Original Room Price:</span>
                        <span class="summary-value">${formatCurrency(guestData.originalPrice || guestData.room?.price || 0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Amount Paid:</span>
                        <span class="summary-value">${formatCurrency(0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Outstanding Balance:</span>
                        <span class="summary-value">${formatCurrency(0)}</span>
                    </div>
                `
                : guestData.isComplimentary
                    ? `
                    <div class="summary-row">
                        <span class="summary-label">Reservation Type:</span>
                        <span class="summary-value">Complimentary</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Original Room Price:</span>
                        <span class="summary-value">${formatCurrency(guestData.originalPrice || guestData.room?.price || 0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Complimentary Discount:</span>
                        <span class="summary-value">-${formatCurrency(guestData.discountAmount || guestData.originalPrice || guestData.room?.price || 0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Final Price:</span>
                        <span class="summary-value">${formatCurrency(0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Amount Paid:</span>
                        <span class="summary-value">${formatCurrency(guestData.amountPaid || 0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Outstanding Balance:</span>
                        <span class="summary-value">${formatCurrency(guestData.outstanding || 0)}</span>
                    </div>
                `
                    : guestData.isDiscounted
                        ? `
                    <div class="summary-row">
                        <span class="summary-label">Reservation Type:</span>
                        <span class="summary-value">Discounted</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Original Room Price:</span>
                        <span class="summary-value">${formatCurrency(guestData.originalPrice || guestData.room?.price || 0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Discount Applied:</span>
                        <span class="summary-value">
                            ${guestData.discountType === 'PERCENTAGE'
                            ? `${guestData.discountValue}% (${formatCurrency(guestData.discountAmount || 0)})`
                            : formatCurrency(
                                guestData.discountAmount || 0,
                            )
                        }
                        </span>
                    </div>
                    ${guestData.discountReason
                            ? `
                    <div class="summary-row">
                        <span class="summary-label">Discount Reason:</span>
                        <span class="summary-value">${guestData.discountReason}</span>
                    </div>
                    `
                            : ''
                        }
                    <div class="summary-row">
                        <span class="summary-label">Final Price:</span>
                        <span class="summary-value">${formatCurrency(guestData.finalPrice || 0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Other Services (Unpaid):</span>
                        <span class="summary-value">${formatCurrency(unpaidServicesTotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Total Paid:</span>
                        <span class="summary-value">${formatCurrency(guestData.amountPaid || 0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Outstanding Balance:</span>
                        <span class="summary-value">${formatCurrency(guestData.outstanding || 0)}</span>
                    </div>
                `
                        : `
                    <div class="summary-row">
                        <span class="summary-label">Reservation Type:</span>
                        <span class="summary-value">Regular</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Room Price:</span>
                        <span class="summary-value">${formatCurrency(guestData.room?.price || 0)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Number of Nights:</span>
                        <span class="summary-value">${nightsStayed}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Total Room Charge:</span>
                        <span class="summary-value">${formatCurrency(totalRoomCharge)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Other Services (Unpaid):</span>
                        <span class="summary-value">${formatCurrency(unpaidServicesTotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Total Paid:</span>
                        <span class="summary-value">${formatCurrency((guestData.amountPaid || 0) + paidServicesTotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Outstanding Balance:</span>
                        <span class="summary-value">${formatCurrency(guestData.outstanding || 0)}</span>
                    </div>
                `
            }
                ${guestData.paymentMethod
                ? `
                <div class="summary-row">
                    <span class="summary-label">Payment Method:</span>
                    <span class="summary-value">${guestData.paymentMethod}</span>
                </div>
                `
                : ''
            }
                ${guestData.receivingAccount
                ? `
                <div class="summary-row">
                    <span class="summary-label">Receiving Account:</span>
                    <span class="summary-value">${guestData.receivingAccount}</span>
                </div>
                `
                : ''
            }
            </div>
        </div>

        <!-- Room Services & Restaurant Orders Section -->
        ${services.length > 0
                ? `
        <div class="section">
            <div class="section-title">Room Services, Restaurant Orders & Activities</div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Payment Status</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${services
                    .map((service: any) => {
                        // Format service name - capitalize first letter of each word
                        const serviceName = service.type
                            ? service.type
                                .split(' ')
                                .map(
                                    (word: string) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase(),
                                )
                                .join(' ')
                            : service.hotelService?.name ||
                            service.name ||
                            'N/A';

                        // Format date - use date field if available, otherwise try createdAt
                        let formattedDate = 'N/A';
                        if (service.date) {
                            const dateObj = new Date(service.date);
                            if (!isNaN(dateObj.getTime())) {
                                formattedDate =
                                    dateObj.toLocaleDateString(
                                        'en-US',
                                        {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        },
                                    );
                                // Add time if available
                                if (service.time) {
                                    const timeParts =
                                        service.time.split(':');
                                    if (timeParts.length >= 2) {
                                        const hours = parseInt(
                                            timeParts[0],
                                            10,
                                        );
                                        const minutes =
                                            timeParts[1].substring(
                                                0,
                                                2,
                                            ); // Get first 2 chars of minutes (ignore seconds)
                                        const ampm =
                                            hours >= 12 ? 'PM' : 'AM';
                                        const displayHours =
                                            hours % 12 || 12;
                                        formattedDate += ` ${displayHours}:${minutes} ${ampm}`;
                                    }
                                }
                            }
                        } else if (service.createdAt) {
                            const dateObj = new Date(service.createdAt);
                            if (!isNaN(dateObj.getTime())) {
                                formattedDate =
                                    dateObj.toLocaleDateString(
                                        'en-US',
                                        {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        },
                                    );
                            }
                        }

                        const rawStatus = String(service.paymentStatus || '').toUpperCase();
                        let badgeText = 'Pending';
                        let badgeClass = 'badge-discounted';
                        if (rawStatus === 'ADDED_TO_BILL') {
                            badgeText = 'Posted To Room';
                            badgeClass = 'badge-regular';
                        } else if (rawStatus === 'BILL_SETTLED_FROM_FRONT_DESK') {
                            badgeText = 'Bill settled from front desk';
                            badgeClass = 'badge-regular';
                        } else if (rawStatus === 'PAID' || rawStatus === 'COMPLETED' || service.isPaid) {
                            badgeText = 'Paid';
                            badgeClass = 'badge-regular';
                        }

                        return `
                            <tr>
                                <td>${serviceName}</td>
                                <td>${formattedDate}</td>
                                <td class="text-right">${formatCurrency(service.amount || service.amountPaid || 0)}</td>
                                <td class="text-center">
                                    <span class="badge ${badgeClass}">
                                        ${badgeText}
                                    </span>
                                </td>
                                <td>${service.notes || '—'}</td>
                            </tr>
                            `;
                    })
                    .join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background-color: #f8fafc; font-weight: 600;">
                            <td colspan="2" class="text-right">Total Services:</td>
                            <td class="text-right">${formatCurrency(services.reduce((sum: number, s: any) => sum + (s.amount || s.amountPaid || 0), 0))}</td>
                            <td colspan="2"></td>
                        </tr>
                        <tr style="background-color: #f8fafc; font-weight: 600;">
                            <td colspan="2" class="text-right">Paid Services:</td>
                            <td class="text-right">${formatCurrency(paidServicesTotal)}</td>
                            <td colspan="2"></td>
                        </tr>
                        <tr style="background-color: #f8fafc; font-weight: 600;">
                            <td colspan="2" class="text-right">Unpaid Services:</td>
                            <td class="text-right">${formatCurrency(unpaidServicesTotal)}</td>
                            <td colspan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        `
                : `
        <div class="section">
            <div class="section-title">Room Services, Restaurant Orders & Activities</div>
            <p style="color: #64748b; font-style: italic;">No services or restaurant orders recorded for this guest.</p>
        </div>
        `
            }

        <!-- Grand Total Section -->
        <div class="section">
            <div class="section-title">Payment Summary</div>
            <div class="grand-total-box">
                <div class="summary-row">
                    <span class="summary-label">Room Charges:</span>
                    <span class="summary-value">${formatCurrency(roomCharge)}</span>
                </div>
                ${!hotel?.frontOfficeVatInclusive && !vatWaived && vatAmount > 0 ? `
                <div class="summary-row">
                    <span class="summary-label">VAT (${vatRate.toFixed(2)}%):</span>
                    <span class="summary-value">${formatCurrency(vatAmount)}</span>
                </div>
                ` : ''}
                ${!serviceChargeWaived && serviceChargeAmount > 0 ? `
                <div class="summary-row">
                    <span class="summary-label">Service Charge (${serviceChargeRate.toFixed(2)}%):</span>
                    <span class="summary-value">${formatCurrency(serviceChargeAmount)}</span>
                </div>
                ` : ''}
                ${!tipWaived && tipAmount > 0 ? `
                <div class="summary-row">
                    <span class="summary-label">Tip (${tipRate.toFixed(2)}%):</span>
                    <span class="summary-value">${formatCurrency(tipAmount)}</span>
                </div>
                ` : ''}
                <div class="summary-row">
                    <span class="summary-label">Services & Orders:</span>
                    <span class="summary-value">${formatCurrency(totalServicesAmount)}</span>
                </div>
                <div class="grand-total-row">
                    <span class="grand-total-label">Grand Total:</span>
                    <span class="grand-total-value">${formatCurrency(grandTotal)}</span>
                </div>
                <div class="summary-row" style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #f59e0b;">
                    <span class="summary-label">Total Paid:</span>
                    <span class="summary-value" style="color: #059669; font-weight: 600;">${formatCurrency(totalPaid)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Outstanding Balance:</span>
                    <span class="summary-value" style="color: ${totalOutstanding > 0 ? '#dc2626' : '#059669'}; font-weight: 600; font-size: 18px;">${formatCurrency(totalOutstanding)}</span>
                </div>
                ${hasWaiver && guestData.waiverReason ? `
                <div class="summary-row">
                    <span class="summary-label">Waiver Reason:</span>
                    <span class="summary-value">${guestData.waiverReason}</span>
                </div>
                ` : ''}
            </div>
        </div>

        ${guestData.checkOutNote
                ? `
        <div class="section">
            <div class="section-title">Check-Out Notes</div>
            <p style="color: #1e293b; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
                ${guestData.checkOutNote}
            </p>
        </div>
        `
                : ''
            }

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })}</p>
        </div>
    </div>
</body>
</html>
        `;

        // Open print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            // Wait for content to load, then print
            printWindow.onload = function () {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.onafterprint = function () {
                        printWindow.close();
                    };
                }, 250);
            };

            // Fallback if onload doesn't fire
            setTimeout(() => {
                if (printWindow && !printWindow.closed) {
                    printWindow.print();
                }
            }, 500);
        }
    } catch (error: any) {
        console.error('Error printing guest payment info:', error);
        alert('Failed to generate print document. Please try again.');
    }
}
