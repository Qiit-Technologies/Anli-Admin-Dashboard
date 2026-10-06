'use client';

import BrandButton from '@/components/common/Button';
import SelectFacility from '@/components/membership/bookings/selectFacility';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Facility } from '@/types/membership/membership';
import { AlertCircle } from 'lucide-react';
import { ScanMemberData } from './MemberScanResult';

interface CheckInPanelProps {
    member: ScanMemberData;
    isValid: boolean;
    selectedFacility: Facility | null;
    onFacilitySelect: (facility: Facility | null) => void;
    accessibleFacilities?: Facility[];
    purposeOfVisit: string;
    onPurposeChange: (value: string) => void;
    notes: string;
    onNotesChange: (value: string) => void;
    onCheckIn: () => void;
    isCheckingIn: boolean;
}

export default function CheckInPanel({
    member,
    isValid,
    selectedFacility,
    onFacilitySelect,
    accessibleFacilities,
    purposeOfVisit,
    onPurposeChange,
    notes,
    onNotesChange,
    onCheckIn,
    isCheckingIn,
}: Readonly<CheckInPanelProps>) {
    const expired = Boolean(member.isExpired);
    const canSubmit = isValid && !expired && Boolean(selectedFacility);

    return (
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div>
                <h3 className="text-sm font-semibold text-gray-900">
                    Complete check-in
                </h3>
                <p className="text-xs text-gray-500">
                    Choose a facility and confirm access for {member.name}.
                </p>
            </div>

            {expired ? (
                <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                        <p className="font-medium">Membership expired</p>
                        <p className="mt-0.5 text-xs text-red-700">
                            Renew before allowing facility access.
                        </p>
                    </div>
                </div>
            ) : null}

            <SelectFacility
                selectedFacility={selectedFacility}
                onFacilitySelect={onFacilitySelect}
                accessibleFacilities={accessibleFacilities}
                disabled={expired}
            />

            <div className="grid gap-3">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Purpose of visit
                    </label>
                    <Input
                        placeholder="e.g. Gym, pool, meeting"
                        value={purposeOfVisit}
                        onChange={(e) => onPurposeChange(e.target.value)}
                        disabled={expired}
                        className="h-11 text-base sm:h-10 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        Notes (optional)
                    </label>
                    <Textarea
                        placeholder="Front desk notes…"
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        rows={2}
                        disabled={expired}
                        className="resize-none"
                    />
                </div>
            </div>

            <BrandButton
                type="button"
                onClick={onCheckIn}
                disabled={!canSubmit || isCheckingIn}
                loading={isCheckingIn}
                fullWidth
                className="h-11"
            >
                {expired ? 'Cannot check in — expired' : 'Complete check-in'}
            </BrandButton>
        </div>
    );
}
