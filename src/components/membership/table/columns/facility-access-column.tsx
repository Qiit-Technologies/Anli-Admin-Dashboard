import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';

export interface Facility {
    id: number;
    name: string;
    category: string;
    isBookable: boolean;
    status: 'active' | 'suspended';
}

export interface ReferralTier {
    id: string;
    name: string;
    description?: string;
    accessLevel?: string;
    facilitiesAccessible?: any[];
}

export interface FacilityAccess {
    facility: Facility;
    tierAccess: Record<string, boolean>;
    maxDuration?: Record<string, string>;
}

interface FacilityAccessColumnProps {
    referralTiers: ReferralTier[];
    onAccessChange: (
        facilityId: number,
        tierName: string,
        hasAccess: boolean,
    ) => void;
    onDurationChange: (
        facilityId: number,
        tierName: string,
        duration: string,
    ) => void;
}

export const createFacilityAccessColumns = ({
    referralTiers,
    onAccessChange,
    onDurationChange,
}: FacilityAccessColumnProps): ColumnDef<FacilityAccess>[] => {
    const columns: ColumnDef<FacilityAccess>[] = [
        {
            accessorKey: 'facility.name',
            header: () => <div className="text-start">Facility Type</div>,
            cell: ({ row }) => (
                <div className="flex flex-col text-start">
                    <span className="font-medium">
                        {row.original.facility.name}
                    </span>
                </div>
            ),
        },
    ];

    columns.push({
        id: 'principal',
        header: 'Principal',
        cell: ({ row }) => {
            const facilityId = row.original.facility.id;
            const isChecked = row.original.tierAccess['principal'] || false;

            return (
                <div className="flex justify-center">
                    <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                            onAccessChange(facilityId, 'principal', !!checked)
                        }
                        className="w-5 h-5 shadow-none data-[state=unchecked]:bg-[#F4F4F4] data-[state=unchecked]:border-[#D9D9D9] data-[state=checked]:bg-hexbrand data-[state=checked]:border-hexbrand"
                    />
                </div>
            );
        },
    });

    referralTiers.forEach((tier) => {
        columns.push({
            id: `tier-${tier.id}`,
            header: () => (
                <div className="flex flex-col items-center">
                    <span>{tier.name}</span>
                    {tier.accessLevel && (
                        <span className="text-xs text-gray-400">
                            ({tier.accessLevel})
                        </span>
                    )}
                </div>
            ),
            cell: ({ row }) => {
                const facilityId = row.original.facility.id;
                const isChecked = row.original.tierAccess[tier.name] || false;

                return (
                    <div className="flex justify-center">
                        <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                                onAccessChange(facilityId, tier.name, !!checked)
                            }
                            className="w-5 h-5 shadow-none data-[state=unchecked]:bg-[#F4F4F4] data-[state=unchecked]:border-[#D9D9D9] data-[state=checked]:bg-hexbrand data-[state=checked]:border-hexbrand"
                        />
                    </div>
                );
            },
        });
    });

    columns.push({
        id: 'maxDuration',
        header: () => (
            <div className="flex items-center">
                <span>Max Duration Allowed</span>
                <svg
                    className="w-4 h-4 ml-1 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        ),
        cell: ({ row }) => {
            const facilityId = row.original.facility.id;
            const duration =
                row.original.maxDuration?.['default'] || 'Unlimited';

            return (
                <select
                    value={duration}
                    onChange={(e) =>
                        onDurationChange(facilityId, 'default', e.target.value)
                    }
                    className="px-2 py-1 text-sm"
                >
                    <option value="1 Hour">1 Hour</option>
                    <option value="2 Hour">2 Hour</option>
                    <option value="3 Hour">3 Hour</option>
                    <option value="Unlimited">Unlimited</option>
                </select>
            );
        },
    });

    return columns;
};
