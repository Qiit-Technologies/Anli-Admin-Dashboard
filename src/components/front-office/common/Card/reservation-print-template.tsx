import { getNights } from '@/lib/helpers';
import { format } from 'date-fns';

export type ReservationPrintHotelInfo = {
    name?: string;
    address?: string;
    /** All hotel phones to render. Multiple entries render as separate "Tel:" tokens. */
    phones?: string[];
    email?: string;
    website?: string;
    logoUrl?: string;
    taxId?: string;
    /**
     * Optional HTML override for the Terms & Conditions block. When provided
     * (non-empty), it replaces the default. Sanitised lightly before render.
     */
    termsHtml?: string;
};

export type ReservationPrintOptions = {
    autoPrint?: boolean;
    staffName?: string;
};

function escapeHtml(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatMoney(amount: number): string {
    try {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `₦${amount.toFixed(2)}`;
    }
}

function formatFullDate(d: string | Date | null | undefined): string {
    if (!d) return '';
    try {
        return format(new Date(d), 'do MMMM yyyy');
    } catch {
        return '';
    }
}

function formatTimeLabel(t: string | null | undefined): string {
    if (!t) return '—';
    return escapeHtml(t);
}

/**
 * Resolve the room number that should appear on the confirmation. Prefer the
 * assigned room (source of truth) and fall back to the legacy denormalised
 * field on the reservation.
 */
function resolveRoomNumber(reservation: any): string {
    const room = reservation?.room;
    const assigned = room?.roomNumber;
    const roman = room?.roomNumberRoman;

    let base = '';
    if (
        assigned !== undefined &&
        assigned !== null &&
        String(assigned).trim()
    ) {
        base = String(assigned);
    } else if (
        reservation?.roomNumber !== undefined &&
        reservation?.roomNumber !== null &&
        String(reservation.roomNumber).trim()
    ) {
        base = String(reservation.roomNumber);
    }

    if (!base) return 'To be assigned';

    if (roman && String(roman).trim()) {
        return `${base} (${roman})`;
    }
    return base;
}

/**
 * Light-touch sanitiser for hotel-supplied Terms HTML. We strip <script> and
 * <style> blocks and inline event handlers. Anything else (p, ul, ol, li,
 * strong, em, br, etc.) is preserved so admins can format their own policy.
 */
function sanitizeTermsHtml(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/\son\w+\s*=\s*'[^']*'/gi, '');
}

/** Full HTML document for reservation confirmation (print / PDF / preview). */
export const reservationPrintTemplate = (
    reservation: any,
    hotel?: ReservationPrintHotelInfo,
    options?: ReservationPrintOptions,
) => {
    if (reservation.isVoid) {
        return null;
    }

    const autoPrint = options?.autoPrint ?? false;
    const staffName = options?.staffName?.trim() || 'Front Desk';

    const hotelName = hotel?.name?.trim() || 'Hotel';
    const logoUrl = hotel?.logoUrl?.trim();
    const hasLogo = Boolean(logoUrl);

    // RC removed by design. Keep VAT only when present.
    const regLine = hotel?.taxId ? `VAT: ${escapeHtml(hotel.taxId)}` : '';

    const phoneTokens = (hotel?.phones ?? [])
        .map((p) => p?.trim())
        .filter((p): p is string => Boolean(p))
        .map((p) => `Tel: ${escapeHtml(p)}`);

    const addressLine = hotel?.address ? escapeHtml(hotel.address) : '';

    const contactRight = [
        ...phoneTokens,
        hotel?.email ? escapeHtml(hotel.email) : '',
        hotel?.website ? escapeHtml(hotel.website) : '',
    ]
        .filter(Boolean)
        .join(' · ');

    const nights = Math.max(
        1,
        getNights(
            reservation.startDate,
            (reservation as any).originalEndDate || reservation.endDate,
        ),
    );
    const ratePerNight = reservation.rebateRate
        ? Number(reservation.rebateRate)
        : Number(reservation.room?.price ?? 0);
    const rateInfo = formatMoney(ratePerNight);
    const totalPayable = reservation.isComplimentary
        ? 0
        : Number(reservation.finalPrice || nights * ratePerNight);
    const totalPayableInfo = formatMoney(totalPayable);

    const rateDescription = reservation.isComplimentary
        ? 'Complimentary rate'
        : reservation.discountType
          ? reservation.discountType === 'PERCENTAGE'
              ? `Discount: ${escapeHtml(reservation.discountValue)}%`
              : `Discounted rate (${formatMoney(Number(reservation.discountValue || 0))})`
          : 'Room rate (per night)';

    let adults = Number(reservation.numberOfGuests) || 1;
    let children = 0;
    if (reservation.secondGuestType === 'child') {
        adults = 1;
        children = 1;
    } else if (
        reservation.secondGuestFullName &&
        reservation.secondGuestType === 'adult'
    ) {
        adults = Math.max(adults, 2);
    }

    const guestFullName = escapeHtml(
        (reservation.fullName?.trim() as string) || 'Guest',
    );
    const confirmationNo = escapeHtml(`#RES-${reservation.id}`);

    const reservedOn = reservation?.createdAt
        ? formatFullDate(reservation.createdAt)
        : '';

    const roomTypeName = escapeHtml(
        reservation?.roomType?.name || 'Not specified',
    );
    const roomNumber = escapeHtml(resolveRoomNumber(reservation));

    const typeNote = reservation.isComplimentary
        ? '<p>This reservation is complimentary.</p>'
        : reservation.discountType
          ? '<p>This reservation includes a special rate or discount as shown above.</p>'
          : '';

    const logoBlock = hasLogo
        ? `<div class="logo-wrap"><img class="logo-img" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(hotelName)}" /></div>`
        : `<div class="logo-placeholder" role="img" aria-label="${escapeHtml(hotelName)}"><span>${escapeHtml(hotelName)}</span></div>`;

    const customTerms = hotel?.termsHtml?.trim()
        ? sanitizeTermsHtml(hotel.termsHtml)
        : '';
    const termsBlock = customTerms
        ? `<div class="terms terms-custom">${customTerms}</div>`
        : `<div class="terms">
            <p>
                <strong>Rates and charges.</strong>
                Published rates may exclude applicable taxes, statutory levies
                (including tourism or other local levies where required), and service
                charges, unless the rate explicitly states they are included.
            </p>
            <p>
                <strong>Payment, deposit, and guarantee.</strong>
                The hotel may require advance payment, a deposit, or a valid card
                guarantee according to your booking. Any balance remains payable at
                check-in or check-out as communicated by the property.
            </p>
            <p>
                <strong>Vouchers and third-party bookings.</strong>
                Reservations made with vouchers, travel partners, or corporate accounts
                may require presentation of the original voucher, confirmation, or
                authorization at check-in.
            </p>
            <p>
                <strong>Identification.</strong>
                Guests may be required to present valid government-issued photo
                identification at check-in in accordance with applicable law.
            </p>
            <p>
                <strong>Cancellation, amendment, and no-show.</strong>
                Changes, cancellations, and failure to arrive are governed by the rate
                plan and policy in effect at the time of booking. Contact the hotel
                directly for assistance.
            </p>
        </div>`;

    const printScript = autoPrint
        ? `
        <script>
            window.onload = function() {
                window.focus();
                setTimeout(function() {
                    window.print();
                }, 300);
            };
        </script>`
        : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Reservation confirmation — ${escapeHtml(reservation.fullName)}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #111;
            line-height: 1.45;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .confirmation-doc {
            padding: 10mm 14mm;
            max-width: 190mm;
            margin: 0 auto;
            background: #fff;
        }
        .header-brand {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e8e8e8;
        }
        /* Logo is bigger but still bounded so a tall letterhead can't push the page. */
        .logo-wrap {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 8px;
        }
        .logo-img {
            max-width: 450px;
            max-height: 140px;
            width: auto;
            height: auto;
            object-fit: contain;
            object-position: center;
            display: block;
        }
        .logo-placeholder {
            max-width: 350px;
            min-height: 100px;
            margin: 0 auto 8px;
            background: #142d52;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            padding: 8px 10px;
            line-height: 1.2;
            letter-spacing: 0.02em;
        }
        .legal-block {
            font-size: 9.5pt;
            color: #222;
            max-width: 560px;
            margin: 0 auto;
        }
        .legal-block .company {
            font-weight: 700;
            font-size: 11pt;
            margin-bottom: 6px;
        }
        .legal-block .meta {
            font-size: 9pt;
            color: #444;
            margin-bottom: 4px;
            word-break: break-word;
        }
        .section-banner {
            background: #142d52;
            color: #fff;
            text-align: center;
            font-weight: 600;
            font-size: 11pt;
            letter-spacing: 0.04em;
            padding: 8px 12px;
            margin: 10px 0 8px;
        }
        .confirm-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 24px;
            font-size: 10pt;
            margin-bottom: 14px;
        }
        .confirm-meta .label {
            font-weight: 600;
            color: #333;
            margin-bottom: 2px;
        }
        .letter {
            font-size: 10pt;
            margin: 10px 0 12px;
        }
        .letter .signoff {
            margin-top: 12px;
            font-weight: 500;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
            font-size: 10pt;
        }
        .details-grid .row {
            display: grid;
            grid-template-columns: 42% 58%;
            border-bottom: 1px solid #eee;
            padding: 6px 0;
        }
        .details-grid .dl { font-weight: 600; color: #333; }
        .terms {
            font-size: 8.5pt;
            color: #333;
            line-height: 1.5;
        }
        .terms p { margin: 0 0 8px; }
        .terms-custom :first-child { margin-top: 0; }
        .terms-custom :last-child { margin-bottom: 0; }
        .terms-custom h1, .terms-custom h2, .terms-custom h3,
        .terms-custom h4, .terms-custom h5, .terms-custom h6 {
            font-size: 9.5pt;
            margin: 6px 0 4px;
        }
        .terms-custom ul, .terms-custom ol { margin: 4px 0 8px 18px; }
        .terms-custom li { margin: 0 0 3px; }
        .footer-note {
            margin-top: 18px;
            font-size: 8pt;
            color: #666;
            text-align: center;
        }
        @media print {
            .confirmation-doc { padding: 8mm 12mm; }
        }
    </style>
</head>
<body>
    <div class="confirmation-doc">
        <header class="header-brand">
            ${logoBlock}
            <div class="legal-block">
                ${hasLogo ? '' : `<div class="company">${escapeHtml(hotelName)}</div>`}
                ${regLine ? `<div class="meta">${regLine}</div>` : ''}
                ${addressLine ? `<div class="meta">${addressLine}</div>` : ''}
                ${contactRight ? `<div class="meta">${contactRight}</div>` : ''}
            </div>
        </header>

        <div class="section-banner">RESERVATION CONFIRMATION</div>

        <div class="confirm-meta">
            <div>
                <div class="label">Reservation confirmation</div>
                <div>${confirmationNo}</div>
            </div>
            <div>
                <div class="label">Date of reservation</div>
                <div>${reservedOn || '—'}</div>
            </div>
            <div>
                <div class="label">Check-in date</div>
                <div>${formatFullDate(reservation.startDate)}</div>
            </div>
            <div>
                <div class="label">Check-out date</div>
                <div>${formatFullDate(reservation.endDate)}</div>
            </div>
            <div>
                <div class="label">Check-in time</div>
                <div>${formatTimeLabel(reservation.startTime)}</div>
            </div>
            <div>
                <div class="label">Check-out time</div>
                <div>${formatTimeLabel(reservation.endTime)}</div>
            </div>
        </div>

        <div class="letter">
            <p>Dear ${guestFullName},</p>
            <p>
                Thank you for choosing <strong>${escapeHtml(hotelName)}</strong>.
                We are pleased to confirm your reservation as detailed below.
                We look forward to welcoming you and ensuring a comfortable stay.
            </p>
            <p class="signoff">See you soon,</p>
        </div>

        <div class="section-banner">RESERVATION DETAILS</div>

        <div class="details-grid">
            <div class="row"><div class="dl">Room type</div><div>${roomTypeName}</div></div>
            <div class="row"><div class="dl">Rate description</div><div>${escapeHtml(rateDescription)}</div></div>
            <div class="row"><div class="dl">No. rooms</div><div>1</div></div>
            <div class="row"><div class="dl">Room number</div><div>${roomNumber}</div></div>
            <div class="row"><div class="dl">Nights</div><div>${nights}</div></div>
            <div class="row"><div class="dl">Rate (per night)</div><div>${escapeHtml(rateInfo)}</div></div>
            <div class="row"><div class="dl">Rate payable</div><div>${escapeHtml(totalPayableInfo)}</div></div>
            <div class="row"><div class="dl">Adults / Children</div><div>${adults} / ${children}</div></div>
        </div>

        ${typeNote}

        <div class="section-banner">TERMS &amp; CONDITIONS</div>
        ${termsBlock}

        <div class="footer-note">
            Please present this confirmation when you arrive. For questions, contact the hotel using the details above.
        </div>
    </div>
    ${printScript}
</body>
</html>`;
};
