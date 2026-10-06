import { formatCurrency } from '@/lib/utils';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ReactNode } from 'react';
import { GuestProfileOverview } from '../types';
import { Button } from '@/components/ui/button';

const InfoRow = ({
    label,
    value,
}: {
    label: string;
    value: string | ReactNode;
}) => (
    <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">
            {label}
        </p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
);

export const OverviewTab = ({ profile }: { profile: GuestProfileOverview }) => {
    return (
        <div className="space-y-6">
            {/* Contact Information */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6">
                <p className="mb-6 text-sm font-semibold text-slate-900">
                    Contact Information
                </p>
                <div className="grid grid-cols-3 gap-6">
                    <InfoRow
                        label="Phone"
                        value={
                            <span className="flex items-center gap-2 text-slate-900">
                                <Phone
                                    size={16}
                                    className="h-4 w-4 text-slate-500"
                                />
                                {profile.contact.phone}
                            </span>
                        }
                    />
                    <InfoRow
                        label="Email"
                        value={
                            <span className="flex items-center gap-2 text-slate-900">
                                <Mail
                                    size={16}
                                    className="h-4 w-4 text-slate-500"
                                />
                                {profile.contact.email}
                            </span>
                        }
                    />
                    <InfoRow
                        label="Address"
                        value={
                            <span className="flex items-center gap-2 text-slate-900">
                                <MapPin
                                    size={16}
                                    className="h-4 w-4 text-slate-500"
                                />
                                {profile.contact.address}
                            </span>
                        }
                    />
                </div>
                <div className="mt-6 border-t border-slate-200"></div>
                <div className="mt-6 grid grid-cols-2 gap-6">
                    <InfoRow
                        label="Preferred Contact"
                        value={profile.contact.preferredContact}
                    />
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Email Consent
                        </p>
                        <Button
                            size="sm"
                            className="h-auto rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800"
                        >
                            {profile.contact.emailConsent ? 'Yes' : 'No'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loyalty & Activity + Billing Summary Combined */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6">
                {/* Loyalty & Activity Section */}
                <div>
                    <p className="mb-6 text-sm font-semibold text-slate-900">
                        Loyalty & Activity
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Loyalty Tier
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-900">
                                    {profile.loyaltyTier}
                                </p>
                                <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-medium text-white">
                                    {profile.loyaltyPoints} pts
                                </span>
                            </div>
                        </div>
                        <InfoRow
                            label="Total Visits"
                            value={profile.totalVisits}
                        />
                        <InfoRow label="Last Visit" value={profile.lastVisit} />
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Customer Type
                            </p>
                            <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                {profile.customerType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="my-6 border-t border-slate-200"></div>

                {/* Billing Summary Section */}
                <div>
                    <p className="mb-6 text-sm font-semibold text-slate-900">
                        Billing Summary
                    </p>
                    <div className="grid grid-cols-1 gap-6">
                        <InfoRow
                            label="Total Billed"
                            value={
                                <span className="text-slate-900">
                                    {formatCurrency(profile.totalBilled)}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Total Paid"
                            value={
                                <span className="text-emerald-600">
                                    {formatCurrency(profile.totalPaid)}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Outstanding Balance"
                            value={
                                <span
                                    className={`font-semibold ${profile.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                                >
                                    {formatCurrency(profile.outstandingBalance)}
                                </span>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
