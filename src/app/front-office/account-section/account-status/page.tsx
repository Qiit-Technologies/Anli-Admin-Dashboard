'use client';
import BrandButton from '@/components/common/Button';
import { SelectField } from '@/components/common/Form';
import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useHotel from '@/hooks/useHotel';
import { useState } from 'react';
import { getAccountStatusByGuest } from '@/app/actions/account-status';
import { searchGuests, getGuestStays } from '@/app/actions/guest-search';
import Toast from '@/components/toast';
import toast from 'react-hot-toast';
import AccountStatusModal from './AccountStatusModal';
import CombinedStatementModal from './CombinedStatementModal';
import AccountStatusSkeleton from '@/components/front-office/account-section/account-status/AccountStatusSkeleton';
import { useBrowserPrint } from '@/hooks/useBrowserPrint';
import { Bed, Calendar, FileText, Printer, CalendarDays } from 'lucide-react';
import { DatePicker } from '@/components/common/DatePicker';

interface Stay {
    guestId: number;
    bookingCode: string;
    roomNumber: string;
    dateDisplay: string;
    status: string;
    isInHouse: boolean;
    startDate: string;
    endDate: string;
    fullName: string;
}

export default function AccountStatusPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [guestOptions, setGuestOptions] = useState<
        { value: string; label: string; badge?: string }[]
    >([]);
    const [selectedGuest, setSelectedGuest] = useState<{
        value: string;
        label: string;
        badge?: string;
    } | null>(null);
    // eslint-disable-next-line no-undef
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null,
    );
    const [guestStays, setGuestStays] = useState<Stay[]>([]);
    const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const { organization } = useHotel();
    const { printInBrowser } = useBrowserPrint();

    // Combined statements state
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [combinedResults, setCombinedResults] = useState<
        { stay: Stay; accountData: any }[]
    >([]);
    const [showCombinedModal, setShowCombinedModal] = useState(false);
    const [loadingCombined, setLoadingCombined] = useState(false);

    type Entry = {
        status?: string | null;
        dateTime: string;
        details: string;
        staff: string;
        deposited: number;
        consumption: number;
        balance: number;
        type?: string;
    };
    const [result, setResult] = useState<{
        roomLabel: string;
        userName: string;
        expDate: string;
        checkinDate: string;
        time: string;
        totalBalance: number;
        entries: Entry[];
    } | null>(null);

    const formatCurrency = (val: number) => {
        const num = Number(val || 0);
        return `₦${Math.round(num).toLocaleString('en-US')}`;
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setGuestOptions([]);
            setGuestStays([]);
            return;
        }

        setSearching(true);
        // Clear previous stays when starting new search
        setGuestStays([]);
        try {
            const response = await searchGuests({
                query: searchQuery.trim(),
            });

            if (response.data) {
                const options = response.data.map((guest: any) => ({
                    value: String(guest.profileId),
                    label: `${guest.fullName}${guest.roomNumbers?.length ? ` - Room${guest.roomNumbers.length > 1 ? 's' : ''} ${guest.roomNumbers.join(', ')}` : ''}${guest.phoneNumber ? ` - ${guest.phoneNumber}` : ''}${guest.email ? ` - ${guest.email}` : ''}`,
                    ...(guest.isCurrentStay ? { badge: 'Current Stay' } : {}),
                }));
                setGuestOptions(options);
                setShowResults(true);
            } else if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Search Error"
                        type="error"
                        description={response.error}
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Search Error"
                    type="error"
                    description="Failed to search guests"
                />
            ));
        } finally {
            setSearching(false);
        }
    };

    const handleInputChange = (value: string) => {
        setSearchQuery(value);

        // Only clear previous data if search input is completely empty
        if (!value.trim()) {
            setSelectedGuest(null);
            setSelectedStay(null);
            setResult(null);
            setShowResults(false);
            setGuestStays([]);
            setFilterStartDate('');
            setFilterEndDate('');
            setCombinedResults([]);
        }

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for search
        if (value.trim()) {
            const timeout = setTimeout(() => {
                handleSearch();
            }, 500); // 500ms debounce
            setSearchTimeout(timeout);
        } else {
            setGuestOptions([]);
            setShowResults(false);
        }
    };

    const handleGuestSearch = async () => {
        if (!selectedGuest) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    type="error"
                    description="Please select a guest"
                />
            ));
            return;
        }

        // Clear previous guest stays when selecting new guest
        setGuestStays([]);
        setSelectedStay(null);
        setResult(null);
        setFilterStartDate('');
        setFilterEndDate('');
        setCombinedResults([]);

        setLoading(true);

        try {
            // Get stays for the selected guest profile
            const staysResponse = await getGuestStays(
                selectedGuest?.value || '',
            );
            console.log('Stays response:', staysResponse);

            if (staysResponse.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        type="error"
                        description={staysResponse.error}
                    />
                ));
                return;
            }

            const stays = staysResponse.data;
            if (!stays || stays.length === 0) {
                toast.custom(() => (
                    <Toast
                        title="No Stays Found"
                        type="error"
                        description="No stays found for this guest"
                    />
                ));
                return;
            }

            // Store stays for selection UI
            setGuestStays(stays);
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    type="error"
                    description="An unexpected error occurred"
                />
            ));
            console.error('Error fetching account status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStaySelect = async (stay: Stay) => {
        setSelectedStay(stay);
        setLoading(true);

        try {
            const response = await getAccountStatusByGuest(
                stay.guestId.toString(),
            );

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        type="error"
                        description={response.error}
                    />
                ));
            } else if (response.data) {
                setResult(response.data);
                setShowResults(true);
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    type="error"
                    description="Failed to load account status"
                />
            ));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateStatement = async (ignoreDates: boolean = false) => {
        if (!selectedGuest) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    type="error"
                    description="Please select a guest first"
                />
            ));
            return;
        }

        const staysToCompile = ignoreDates
            ? guestStays
            : guestStays.filter((stay) => {
                  if (!filterStartDate && !filterEndDate) return true;
                  const stayStart = new Date(stay.startDate);
                  const stayEnd = new Date(stay.endDate);

                  if (filterStartDate) {
                      const fStart = new Date(filterStartDate);
                      fStart.setHours(0, 0, 0, 0);
                      stayEnd.setHours(0, 0, 0, 0);
                      if (stayEnd < fStart) return false;
                  }

                  if (filterEndDate) {
                      const fEnd = new Date(filterEndDate);
                      fEnd.setHours(23, 59, 59, 999);
                      stayStart.setHours(0, 0, 0, 0);
                      if (stayStart > fEnd) return false;
                  }

                  return true;
              });

        if (staysToCompile.length === 0) {
            toast.custom(() => (
                <Toast
                    title="No Stays Found"
                    type="error"
                    description={
                        ignoreDates
                            ? 'This guest has no registered stays.'
                            : 'No stays found within the selected date range.'
                    }
                />
            ));
            return;
        }

        setLoadingCombined(true);
        try {
            const results = await Promise.all(
                staysToCompile.map(async (stay) => {
                    const response = await getAccountStatusByGuest(
                        stay.guestId.toString(),
                    );
                    if (response.success && response.data) {
                        return {
                            stay,
                            accountData: response.data,
                        };
                    }
                    return null;
                }),
            );

            const validResults = results.filter((r) => r !== null) as {
                stay: Stay;
                accountData: any;
            }[];

            if (validResults.length === 0) {
                toast.custom(() => (
                    <Toast
                        title="Compilation Failed"
                        type="error"
                        description="Failed to load account data for stays."
                    />
                ));
                return;
            }

            // Sort by stay startDate ascending
            validResults.sort(
                (a, b) =>
                    new Date(a.stay.startDate).getTime() -
                    new Date(b.stay.startDate).getTime(),
            );

            setCombinedResults(validResults);
            setShowCombinedModal(true);
        } catch (err) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    type="error"
                    description="An error occurred while compiling stays."
                />
            ));
            console.error(err);
        } finally {
            setLoadingCombined(false);
        }
    };

    const handlePrintCombined = () => {
        if (combinedResults.length === 0) return;

        const totalCharges = combinedResults.reduce((sum, item) => {
            const stayCharges = item.accountData.entries.reduce(
                (s: number, entry: any) => s + (Number(entry.consumption) || 0),
                0,
            );
            return sum + stayCharges;
        }, 0);

        const totalPaid = combinedResults.reduce((sum, item) => {
            const stayPaid = item.accountData.entries.reduce(
                (s: number, entry: any) => {
                    let paid = s + (Number(entry.deposited) || 0);
                    if (
                        entry.status === 'Paid' &&
                        (entry.type === 'service' || entry.type === 'order')
                    ) {
                        paid += Number(entry.consumption) || 0;
                    }
                    return paid;
                },
                0,
            );
            return sum + stayPaid;
        }, 0);

        const grandOutstanding = Math.max(0, totalCharges - totalPaid);

        const periodText =
            filterStartDate && filterEndDate
                ? `${new Date(filterStartDate).toLocaleDateString()} – ${new Date(filterEndDate).toLocaleDateString()}`
                : 'Complete Stay History';

        const guestName = selectedGuest
            ? selectedGuest.label.split(' - ')[0]
            : 'Guest';

        const html = `
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>Combined Account Statement - ${guestName}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body { 
                        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                        padding: 0; 
                        margin: 0;
                        color: #1a1a1a;
                        line-height: 1.4;
                    }
                    .container {
                        max-width: 100%;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 25px;
                        border-bottom: 2px solid #f3f4f6;
                        padding-bottom: 15px;
                    }
                    .logo {
                        max-height: 60px;
                        margin-bottom: 10px;
                    }
                    .hotel-name {
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 0;
                        color: #111;
                    }
                    .hotel-address {
                        font-size: 9pt;
                        color: #666;
                        margin-top: 4px;
                    }
                    .report-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 20px;
                        border-bottom: 1px solid #f3f4f6;
                        padding-bottom: 15px;
                    }
                    .report-title h1 {
                        font-size: 16pt;
                        margin: 0;
                        color: #111;
                    }
                    .report-title p {
                        font-size: 10pt;
                        color: #555;
                        margin: 6px 0 0 0;
                    }
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 25px;
                    }
                    .summary-card {
                        background: #f9fafb;
                        border: 1px solid #e5e7eb;
                        border-radius: 6px;
                        padding: 10px;
                        text-align: center;
                    }
                    .summary-card.accent {
                        background: #fef8f3;
                        border-color: #fbd5c0;
                    }
                    .summary-card.success {
                        background: #f0fdf4;
                        border-color: #bbf7d0;
                    }
                    .summary-card.info {
                        background: #f0f9ff;
                        border-color: #bae6fd;
                    }
                    .card-label {
                        font-size: 7.5pt;
                        color: #6b7280;
                        text-transform: uppercase;
                        font-weight: 600;
                        display: block;
                        margin-bottom: 4px;
                    }
                    .card-value {
                        font-size: 12pt;
                        font-weight: bold;
                        color: #111827;
                    }
                    .summary-card.accent .card-value { color: #c2410c; }
                    .summary-card.success .card-value { color: #15803d; }
                    .summary-card.info .card-value { color: #0369a1; }

                    .stay-section {
                        margin-bottom: 35px;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        overflow: hidden;
                        page-break-inside: avoid;
                    }
                    .stay-header {
                        background: #f3f4f6;
                        padding: 10px 15px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .stay-title {
                        font-size: 10.5pt;
                        font-weight: bold;
                        color: #1f2937;
                        margin: 0;
                    }
                    .stay-meta {
                        font-size: 8.5pt;
                        color: #4b5563;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                    }
                    th { 
                        background: #f9fafb;
                        border-bottom: 1px solid #e5e7eb;
                        padding: 8px 10px;
                        text-align: left;
                        font-size: 8pt;
                        color: #4b5563;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    td { 
                        border-bottom: 1px solid #f3f4f6;
                        padding: 8px 10px;
                        font-size: 8.5pt;
                        color: #374151;
                        vertical-align: middle;
                    }
                    .text-right { text-align: right; }
                    .stay-footer {
                        background: #fafafa;
                        padding: 10px 15px;
                        display: flex;
                        justify-content: flex-end;
                        gap: 20px;
                        font-size: 9pt;
                        font-weight: 600;
                        border-top: 1px solid #f3f4f6;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 8pt;
                        color: #9ca3af;
                        border-top: 1px solid #f3f4f6;
                        padding-top: 12px;
                    }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        .stay-section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${organization?.coverImage ? `<img src="${organization.coverImage}" alt="Logo" class="logo">` : ''}
                        <div class="hotel-name">${organization?.name ?? 'Hotel'}</div>
                        <div class="hotel-address">${organization?.address ?? ''}</div>
                    </div>
                    
                    <div class="report-header">
                        <div class="report-title">
                            <h1>Combined Account Statement</h1>
                            <p>Guest Name: <strong>${guestName}</strong></p>
                        </div>
                        <div style="text-align: right; font-size: 9pt; color: #555;">
                            Generated on ${new Date().toLocaleDateString()}<br/>
                            Period: ${periodText}
                        </div>
                    </div>

                    <div class="summary-grid">
                        <div class="summary-card">
                            <span class="card-label">Total Stays</span>
                            <span class="card-value">${combinedResults.length}</span>
                        </div>
                        <div class="summary-card accent">
                            <span class="card-label">Grand Charges</span>
                            <span class="card-value">${formatCurrency(totalCharges)}</span>
                        </div>
                        <div class="summary-card success">
                            <span class="card-label">Grand Paid</span>
                            <span class="card-value">${formatCurrency(totalPaid)}</span>
                        </div>
                        <div class="summary-card info">
                            <span class="card-label">Grand Outstanding</span>
                            <span class="card-value">${formatCurrency(grandOutstanding)}</span>
                        </div>
                    </div>

                    ${combinedResults
                        .map(({ stay, accountData }, idx) => {
                            const stayCharges = accountData.entries.reduce(
                                (s: number, e: any) =>
                                    s + (Number(e.consumption) || 0),
                                0,
                            );
                            const stayPaid = accountData.entries.reduce(
                                (s: number, e: any) => {
                                    let p = s + (Number(e.deposited) || 0);
                                    if (
                                        e.status === 'Paid' &&
                                        (e.type === 'service' ||
                                            e.type === 'order')
                                    ) {
                                        p += Number(e.consumption) || 0;
                                    }
                                    return p;
                                },
                                0,
                            );
                            const stayOutstanding = Math.max(
                                0,
                                stayCharges - stayPaid,
                            );

                            return `
                            <div class="stay-section">
                                <div class="stay-header">
                                    <div class="stay-title">
                                        Stay #${idx + 1}: Room ${stay.roomNumber} (${stay.dateDisplay})
                                    </div>
                                    <div class="stay-meta">
                                        Booking: <strong>${stay.bookingCode || 'N/A'}</strong>
                                    </div>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style="width: 18%;">Date & Time</th>
                                            <th style="width: 40%;">Details</th>
                                            <th style="width: 14%;">Staff</th>
                                            <th style="width: 14%;" class="text-right">Deposited</th>
                                            <th style="width: 14%;" class="text-right">Charges</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${accountData.entries
                                            .map(
                                                (e: any) => `
                                            <tr>
                                                <td>${e.dateTime}</td>
                                                <td>
                                                    ${e.details}
                                                    ${e.status ? `<span style="font-size: 7.5pt; font-weight: 600; padding: 1px 4px; border-radius: 3px; background: #f3f4f6; margin-left: 5px;">${e.status}</span>` : ''}
                                                </td>
                                                <td>${e.staff}</td>
                                                <td class="text-right font-semibold" style="color: #15803d;">
                                                    ${e.deposited > 0 ? formatCurrency(e.deposited) : '—'}
                                                </td>
                                                <td class="text-right font-semibold" style="color: #c2410c;">
                                                    ${e.consumption > 0 ? formatCurrency(e.consumption) : '—'}
                                                </td>
                                            </tr>
                                        `,
                                            )
                                            .join('')}
                                    </tbody>
                                </table>
                                <div class="stay-footer">
                                    <div style="color: #c2410c;">Charges: ${formatCurrency(stayCharges)}</div>
                                    <div style="color: #15803d;">Paid: ${formatCurrency(stayPaid)}</div>
                                    <div style="color: #0369a1;">Outstanding: ${formatCurrency(stayOutstanding)}</div>
                                </div>
                            </div>
                        `;
                        })
                        .join('')}

                    <div class="footer">
                        <p>This is a computer-generated combined statement. Printed on ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;
        printInBrowser(html);
    };

    const handlePrint = () => {
        if (!result) return;

        const totalAmountPaid = result.entries.reduce((s, r) => {
            let paid = s + (Number(r.deposited) || 0);
            if (
                r.status === 'Paid' &&
                (r.type === 'service' || r.type === 'order')
            ) {
                paid += Number(r.consumption) || 0;
            }
            return paid;
        }, 0);

        const totalConsumption = result.entries.reduce(
            (s, r) => s + (Number(r.consumption) || 0),
            0,
        );

        const outstandingBalance = Math.max(
            0,
            totalConsumption - totalAmountPaid,
        );

        const html = `
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>Account Status - ${result.roomLabel} - ${result.userName}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body { 
                        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                        padding: 0; 
                        margin: 0;
                        color: #1a1a1a;
                        line-height: 1.4;
                    }
                    .container {
                        max-width: 100%;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #f3f4f6;
                        padding-bottom: 20px;
                    }
                    .logo {
                        max-height: 70px;
                        margin-bottom: 12px;
                    }
                    .hotel-name {
                        font-size: 22pt;
                        font-weight: bold;
                        margin: 0;
                        color: #111;
                    }
                    .hotel-address {
                        font-size: 10pt;
                        color: #666;
                        margin-top: 4px;
                    }
                    .report-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 20px;
                    }
                    .report-title h1 {
                        font-size: 18pt;
                        margin: 0;
                        color: #111;
                    }
                    .report-title p {
                        font-size: 10pt;
                        color: #666;
                        margin: 4px 0 0 0;
                    }
                    .total-balance-box {
                        text-align: right;
                    }
                    .total-balance-label {
                        font-size: 9pt;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .total-balance-value {
                        font-size: 20pt;
                        font-weight: bold;
                        color: #000;
                    }
                    .guest-info-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                        background: #f9fafb;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 25px;
                    }
                    .info-item label {
                        display: block;
                        font-size: 7.5pt;
                        color: #6b7280;
                        text-transform: uppercase;
                        margin-bottom: 2px;
                        font-weight: 600;
                    }
                    .info-item span {
                        font-size: 10pt;
                        font-weight: 500;
                        color: #111827;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 20px;
                    }
                    th { 
                        background: #f3f4f6;
                        border: 1px solid #e5e7eb;
                        padding: 10px 8px;
                        text-align: left;
                        font-size: 9pt;
                        color: #374151;
                        font-weight: 600;
                    }
                    td { 
                        border: 1px solid #e5e7eb;
                        padding: 8px;
                        font-size: 9pt;
                        color: #4b5563;
                        vertical-align: top;
                    }
                    .text-right { text-align: right; }
                    .summary-container {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 10px;
                    }
                    .summary-table {
                        width: 300px;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 6px 0;
                        border-bottom: 1px solid #f3f4f6;
                    }
                    .summary-label {
                        font-size: 10pt;
                        color: #4b5563;
                    }
                    .summary-value {
                        font-size: 10pt;
                        font-weight: 600;
                        color: #111827;
                    }
                    .summary-row.total {
                        border-bottom: none;
                        padding-top: 12px;
                    }
                    .summary-row.total .summary-label {
                        font-size: 12pt;
                        font-weight: bold;
                        color: #111;
                    }
                    .summary-row.total .summary-value {
                        font-size: 12pt;
                        font-weight: bold;
                        color: #111;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 8pt;
                        color: #9ca3af;
                        border-top: 1px solid #f3f4f6;
                        padding-top: 15px;
                    }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${organization?.coverImage ? `<img src="${organization.coverImage}" alt="Logo" class="logo">` : ''}
                        <div class="hotel-name">${organization?.name ?? 'Hotel'}</div>
                        <div class="hotel-address">${organization?.address ?? ''}</div>
                    </div>
                    
                    <div class="report-header">
                        <div class="report-title">
                            <h1>Account Status</h1>
                            <p>Room: ${result.roomLabel}</p>
                        </div>
                        <div class="total-balance-box">
                            <div class="total-balance-label">Total Balance</div>
                            <div class="total-balance-value">${formatCurrency(result.totalBalance)}</div>
                        </div>
                    </div>
 
                    <div class="guest-info-grid">
                        <div class="info-item">
                            <label>Guest Name</label>
                            <span>${result.userName}</span>
                        </div>
                        <div class="info-item">
                            <label>Check-in Date</label>
                            <span>${result.checkinDate}</span>
                        </div>
                        <div class="info-item">
                            <label>Exp. Departure</label>
                            <span>${result.expDate}</span>
                        </div>
                        <div class="info-item">
                            <label>Generated Time</label>
                            <span>${result.time}</span>
                        </div>
                    </div>
 
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 18%;">Date & Time</th>
                                <th style="width: 30%;">Details</th>
                                <th style="width: 15%;">Staff</th>
                                <th style="width: 12%;" class="text-right">Deposited</th>
                                <th style="width: 12%;" class="text-right">Consumption</th>
                                <th style="width: 13%;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.entries
                                .map(
                                    (e) => `
                                <tr>
                                    <td>${e.dateTime}</td>
                                    <td>${e.details}</td>
                                    <td>${e.staff}</td>
                                    <td class="text-right">${formatCurrency(e.deposited)}</td>
                                    <td class="text-right">${formatCurrency(e.consumption)}</td>
                                    <td>${e.status || '-'}</td>
                                </tr>
                            `,
                                )
                                .join('')}
                        </tbody>
                    </table>
 
                    <div class="summary-container">
                        <div class="summary-table">
                            <div class="summary-row">
                                <span class="summary-label">Total Amount Paid:</span>
                                <span class="summary-value">${formatCurrency(totalAmountPaid)}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Outstanding Balance:</span>
                                <span class="summary-value">${formatCurrency(outstandingBalance)}</span>
                            </div>
                            <div class="summary-row total">
                                <span class="summary-label">Total Charges:</span>
                                <span class="summary-value">${formatCurrency(totalConsumption)}</span>
                            </div>
                        </div>
                    </div>
 
                    <div class="footer">
                        <p>This is a computer-generated document. Printed on ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;
        printInBrowser(html);
    };

    const getMatchingStays = () => {
        return guestStays.filter((stay) => {
            if (!filterStartDate && !filterEndDate) return true;
            const stayStart = new Date(stay.startDate);
            const stayEnd = new Date(stay.endDate);
            if (filterStartDate) {
                const fStart = new Date(filterStartDate);
                fStart.setHours(0, 0, 0, 0);
                stayEnd.setHours(0, 0, 0, 0);
                if (stayEnd < fStart) return false;
            }
            if (filterEndDate) {
                const fEnd = new Date(filterEndDate);
                fEnd.setHours(23, 59, 59, 999);
                stayStart.setHours(0, 0, 0, 0);
                if (stayStart > fEnd) return false;
            }
            return true;
        });
    };
    const matchingStays = getMatchingStays();

    if (loading) {
        return <AccountStatusSkeleton />;
    }

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Account Status"
                    subtitle={`Tracks amounts guests owe to the hotel`}
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div className="rounded-xl p-6 -mx-4 lg:-mx-8">
                    <Tabs
                        defaultValue="room"
                        className="flex flex-col lg:flex-row gap-6"
                    >
                        {/* TabsList commented out as requested to only show Room search
                        <TabsList className="lg:flex lg:flex-col gap-2 w-full lg:w-[220px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">
                            <TabsTrigger
                                value="room"
                                className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:font-semibold"
                            >
                                Room
                            </TabsTrigger>
                            <TabsTrigger
                                value="group"
                                className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:font-semibold"
                            >
                                Group
                            </TabsTrigger>
                            <TabsTrigger
                                value="company"
                                className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:font-semibold"
                            >
                                Company
                            </TabsTrigger>
                            <TabsTrigger
                                value="summary"
                                className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:font-semibold"
                            >
                                Full Summary
                            </TabsTrigger>
                        </TabsList>
                        */}

                        <div className="flex-1 min-w-0">
                            <TabsContent
                                value="room"
                                className="m-0 grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-full"
                            >
                                <Card className="bg-[#F3F9FF] border border-gray-200 p-6 rounded-xl w-full xl:col-span-5 shadow-sm">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col">
                                            <input
                                                type="text"
                                                placeholder="Search by name, phone, or email..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                                            />
                                        </div>

                                        <SelectField
                                            id="guestSelect"
                                            name="guestSelect"
                                            label="Select Guest"
                                            className="bg-white ring-border border shadow-none border-gray-300 h-10"
                                            value={selectedGuest?.value || ''}
                                            onValueChange={(value) => {
                                                const foundGuest = value
                                                    ? guestOptions.find(
                                                          (opt) =>
                                                              opt.value ===
                                                              value,
                                                      ) || null
                                                    : null;
                                                setSelectedGuest(foundGuest);

                                                // Clear previous guest stays when new guest is selected
                                                setGuestStays([]);
                                                setSelectedStay(null);
                                                setResult(null);
                                                setFilterStartDate('');
                                                setFilterEndDate('');
                                                setCombinedResults([]);
                                            }}
                                            options={guestOptions}
                                            placeholder={
                                                searching
                                                    ? 'Searching...'
                                                    : guestOptions.length === 0
                                                      ? searchQuery.trim()
                                                          ? 'No guests found'
                                                          : 'Search for guests above'
                                                      : 'Select Guest'
                                            }
                                        />

                                        {guestStays.length > 0 ? (
                                            <div className="mt-4 space-y-3">
                                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                                    <h4 className="text-sm font-semibold text-gray-800">
                                                        Available Stays
                                                    </h4>
                                                    <span className="text-xs text-gray-500">
                                                        ({guestStays.length}{' '}
                                                        found)
                                                    </span>
                                                </div>
                                                {guestStays.map((stay) => (
                                                    <div
                                                        key={stay.guestId}
                                                        onClick={() =>
                                                            handleStaySelect(
                                                                stay,
                                                            )
                                                        }
                                                        className="group bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-200"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* Simple Room Icon */}
                                                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Bed className="w-5 h-5 text-gray-600" />
                                                            </div>

                                                            {/* Main Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium text-gray-900">
                                                                        {
                                                                            stay.dateDisplay
                                                                        }
                                                                    </span>
                                                                    {stay.isInHouse && (
                                                                        <span className="text-xs bg-emerald-200 rounded-full px-2 py-1 text-emerald-700 font-medium">
                                                                            Current
                                                                            Stay
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                                                                    <span>
                                                                        Room{' '}
                                                                        <span className="font-semibold text-gray-900">
                                                                            {
                                                                                stay.roomNumber
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                    <span>
                                                                        ·
                                                                    </span>
                                                                    <span className="capitalize">
                                                                        {stay.status
                                                                            .toLowerCase()
                                                                            .replace(
                                                                                /_/g,
                                                                                ' ',
                                                                            )}
                                                                    </span>
                                                                </div>

                                                                {stay.bookingCode && (
                                                                    <div className="mt-2 text-xs text-gray-500">
                                                                        Booking:{' '}
                                                                        <span className="font-mono text-gray-700">
                                                                            {
                                                                                stay.bookingCode
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}

                                        <BrandButton
                                            className="w-full"
                                            onClick={handleGuestSearch}
                                            disabled={loading || !selectedGuest}
                                        >
                                            {loading
                                                ? 'Loading...'
                                                : 'Get Guest Stay'}
                                        </BrandButton>
                                    </div>
                                </Card>

                                {/* Right Side: Date Range Filter & Combined Statement Panel */}
                                {selectedGuest ? (
                                    <Card className="bg-white border border-gray-200 p-6 rounded-xl w-full xl:col-span-7 shadow-sm">
                                        <div className="flex flex-col gap-6">
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-orange-500" />
                                                    Guest History & Statements
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Select an optional date
                                                    range to generate a combined
                                                    statement, or leave blank to
                                                    compile the complete stay
                                                    history.
                                                </p>
                                            </div>

                                            {/* Date Range Selectors */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <DatePicker
                                                    id="startDateFilter"
                                                    label="Start Date (Optional)"
                                                    placeholder="Select start date"
                                                    value={filterStartDate}
                                                    onChange={(date) =>
                                                        setFilterStartDate(date)
                                                    }
                                                    className="bg-white border-gray-200"
                                                />
                                                <DatePicker
                                                    id="endDateFilter"
                                                    label="End Date (Optional)"
                                                    placeholder="Select end date"
                                                    value={filterEndDate}
                                                    onChange={(date) =>
                                                        setFilterEndDate(date)
                                                    }
                                                    className="bg-white border-gray-200"
                                                />
                                            </div>

                                            {/* Clear Date Filters Button */}
                                            {(filterStartDate ||
                                                filterEndDate) && (
                                                <button
                                                    onClick={() => {
                                                        setFilterStartDate('');
                                                        setFilterEndDate('');
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-700 font-medium self-end flex items-center gap-1 transition-colors"
                                                >
                                                    Clear Date Filters
                                                </button>
                                            )}

                                            {/* Matching Stays Summary */}
                                            {guestStays.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                                                        <CalendarDays className="w-4 h-4 text-gray-400" />
                                                        Stays in Selected Period
                                                        ({matchingStays.length}{' '}
                                                        of {guestStays.length})
                                                    </h4>

                                                    {matchingStays.length >
                                                    0 ? (
                                                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                                                            {matchingStays.map(
                                                                (stay, idx) => (
                                                                    <div
                                                                        key={
                                                                            stay.guestId
                                                                        }
                                                                        className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/30 text-xs"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-semibold text-gray-500 w-5">
                                                                                #
                                                                                {idx +
                                                                                    1}
                                                                            </span>
                                                                            <span className="font-medium text-gray-900">
                                                                                Room{' '}
                                                                                {
                                                                                    stay.roomNumber
                                                                                }
                                                                            </span>
                                                                            <span className="text-gray-400">
                                                                                |
                                                                            </span>
                                                                            <span className="text-gray-600">
                                                                                {
                                                                                    stay.dateDisplay
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <span
                                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                                                stay.isInHouse
                                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                stay.status
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                                                            No stays found for
                                                            the selected date
                                                            range. Please select
                                                            another timeframe or
                                                            clear filters.
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                                {/* <BrandButton
                                                    onClick={() => handleGenerateStatement(true)}
                                                    disabled={loadingCombined || guestStays.length === 0}
                                                    className="flex-1 bg-white border border-orange-500 text-orange-600 hover:bg-orange-50 animate-fade-in"
                                                    icon={<Printer className="w-4 h-4 mr-2" />}
                                                >
                                                    {loadingCombined ? 'Compiling...' : 'Print Full History'}
                                                </BrandButton> */}

                                                <BrandButton
                                                    onClick={() =>
                                                        handleGenerateStatement(
                                                            false,
                                                        )
                                                    }
                                                    disabled={
                                                        loadingCombined ||
                                                        matchingStays.length ===
                                                            0
                                                    }
                                                    className="flex-1 animate-fade-in"
                                                    icon={
                                                        <FileText className="w-4 h-4 mr-2" />
                                                    }
                                                >
                                                    {loadingCombined
                                                        ? 'Generating...'
                                                        : 'Generate Statement Preview'}
                                                </BrandButton>
                                            </div>
                                        </div>
                                    </Card>
                                ) : (
                                    <Card className="hidden xl:flex bg-gray-50 border border-dashed border-gray-300 p-6 rounded-xl w-full xl:col-span-7 justify-center items-center h-[350px]">
                                        <div className="text-center max-w-sm flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                <CalendarDays className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">
                                                Generate Guest Statements
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Search for and select a guest on
                                                the left to activate historical
                                                account statements and custom
                                                date-range queries.
                                            </p>
                                        </div>
                                    </Card>
                                )}

                                {showResults && result && (
                                    <AccountStatusModal
                                        open={showResults}
                                        onOpenChange={setShowResults}
                                        organization={organization}
                                        result={result}
                                        formatCurrency={formatCurrency}
                                        onPrint={handlePrint}
                                    />
                                )}

                                {showCombinedModal &&
                                    combinedResults.length > 0 && (
                                        <CombinedStatementModal
                                            open={showCombinedModal}
                                            onOpenChange={setShowCombinedModal}
                                            organization={organization}
                                            guestName={
                                                selectedGuest
                                                    ? selectedGuest.label.split(
                                                          ' - ',
                                                      )[0]
                                                    : 'Guest'
                                            }
                                            filterStartDate={filterStartDate}
                                            filterEndDate={filterEndDate}
                                            compiledResults={combinedResults}
                                            formatCurrency={formatCurrency}
                                            onPrint={handlePrintCombined}
                                        />
                                    )}
                            </TabsContent>

                            {/* Unused TabsContent sections commented out as requested
                            <TabsContent
                                value="group"
                                className="m-0 flex items-start justify-start"
                            >
                                <Card className="bg-white border border-gray-200 p-6 rounded-xl w-full max-w-[600px] shadow-sm">
                                    <div className="text-sm text-muted-foreground">
                                        Group search coming soon.
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent
                                value="company"
                                className="m-0 flex items-start justify-start"
                            >
                                <Card className="bg-white border border-gray-200 p-6 rounded-xl w-full max-w-[600px] shadow-sm">
                                    <div className="text-sm text-muted-foreground">
                                        Company search coming soon.
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent
                                value="summary"
                                className="m-0 flex items-start justify-start"
                            >
                                <Card className="bg-white border border-gray-200 p-6 rounded-xl w-full max-w-[600px] shadow-sm">
                                    <div className="text-sm text-muted-foreground">
                                        Full summary coming soon.
                                    </div>
                                </Card>
                            </TabsContent>
                            */}
                        </div>
                    </Tabs>
                </div>
            </PageWrapper>
        </div>
    );
}
