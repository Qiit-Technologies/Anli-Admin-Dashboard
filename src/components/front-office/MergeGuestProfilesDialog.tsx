'use client';

import { useState, useEffect } from 'react';
import CustomDialog from '@/components/common/CustomDialog';
import { SearchableSelect } from '@/components/common/Form';
import {
    mergeProfiles,
    searchGuestProfiles,
    type GuestProfile,
} from '@/app/actions/guest-profile';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import {
    AlertTriangle,
    ArrowDown,
    UserMinus,
    UserCheck,
    Wallet,
    History,
    Hash,
    FileText,
    Mail,
    Phone,
} from 'lucide-react';

interface MergeGuestProfilesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    initialSourceProfile?: GuestProfile | null;
}

export function MergeGuestProfilesDialog({
    open,
    onOpenChange,
    onSuccess,
    initialSourceProfile,
}: MergeGuestProfilesDialogProps) {
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [profiles, setProfiles] = useState<GuestProfile[]>([]);
    const [sourceProfileId, setSourceProfileId] = useState<string>('');
    const [targetProfileId, setTargetProfileId] = useState<string>('');

    const sourceProfile =
        profiles.find((p) => p.id.toString() === sourceProfileId) ||
        (initialSourceProfile?.id.toString() === sourceProfileId
            ? initialSourceProfile
            : null);
    const targetProfile = profiles.find(
        (p) => p.id.toString() === targetProfileId,
    );

    useEffect(() => {
        if (open) {
            fetchProfiles();
            if (initialSourceProfile) {
                setSourceProfileId(initialSourceProfile.id.toString());
                setProfiles((prev) => {
                    if (prev.find((p) => p.id === initialSourceProfile.id))
                        return prev;
                    return [...prev, initialSourceProfile];
                });
            }
        }
    }, [open, initialSourceProfile]);

    const fetchProfiles = async (query: string = '') => {
        setSearching(true);
        try {
            const result = await searchGuestProfiles({
                query,
                includeUnlinkedStays: true,
            });
            if (result.data) {
                setProfiles(result.data);
            }
        } catch (error: any) {
            console.error('Error searching profiles:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleConfirm = async () => {
        if (!sourceProfileId || !targetProfileId) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please select both source and target profiles"
                    type="error"
                />
            ));
            return;
        }

        if (sourceProfileId === targetProfileId) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Cannot merge a profile with itself"
                    type="error"
                />
            ));
            return;
        }

        setLoading(true);
        try {
            const result = await mergeProfiles(
                parseInt(sourceProfileId),
                parseInt(targetProfileId),
                sourceProfile?.isProfile === false ? 'GUEST' : 'PROFILE',
                targetProfile?.isProfile === false ? 'GUEST' : 'PROFILE',
            );

            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            result.error ??
                            'An error occurred while merging profiles'
                        }
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Profiles merged successfully"
                        type="success"
                    />
                ));
                // Reset modal state
                setSourceProfileId('');
                setTargetProfileId('');
                setProfiles([]);

                onOpenChange(false);
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error: any) {
            console.error('Error merging profiles:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to merge profiles"
                    type="error"
                />
            ));
        } finally {
            setLoading(false);
        }
    };

    const profileOptions = profiles.map((p) => ({
        value: p.id.toString(),
        label: `${p.isProfile === false ? '[Stay] ' : '[Profile] '}${p.fullName || 'No Name'} (#${p.id}) ${p.phoneNumber ? ` - ${p.phoneNumber}` : ''}`,
    }));

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Consolidate Guest Profiles"
            description="Merge duplicate profiles into a single record. This action is permanent."
            confirmText="Merge Profiles"
            cancelText="Cancel"
            onConfirm={handleConfirm}
            isLoading={loading}
            confirmDisabled={
                !sourceProfileId ||
                !targetProfileId ||
                sourceProfileId === targetProfileId ||
                loading
            }
            maxWidth="lg"
            footerType="full"
        >
            <div className="space-y-6 py-4">
                {/* Warning Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">
                            Important Consideration
                        </p>
                        <p>
                            All stays, transaction history, and credit balances
                            from the source profile will be moved. The source
                            profile record will be permanently deleted.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 relative">
                    {/* Source Selection */}
                    <div
                        className={`p-4 rounded-xl border-2 transition-all ${sourceProfile ? 'border-red-100 bg-red-50/30' : 'border-dashed border-gray-200'}`}
                    >
                        <div className="flex items-center gap-2 mb-3 text-red-600">
                            <UserMinus className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Source Profile (To be deleted)
                            </span>
                        </div>
                        <SearchableSelect
                            label=""
                            id="sourceProfile"
                            options={profileOptions}
                            value={sourceProfileId}
                            onValueChange={setSourceProfileId}
                            onSearch={fetchProfiles}
                            placeholder="Search source profile..."
                        />
                        {sourceProfile && (
                            <div className="mt-3 grid grid-cols-1 gap-2 text-[11px]">
                                <div className="flex items-center gap-1.5 text-orion-blue font-bold">
                                    <Hash className="w-3 h-3" />
                                    <span>System ID: #{sourceProfile.id}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>
                                        ID Number:{' '}
                                        {sourceProfile.IDNumber ||
                                            (sourceProfile as any).idNumber ||
                                            'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="truncate">
                                        {sourceProfile.email || 'No Email'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>
                                        {sourceProfile.phoneNumber ||
                                            'No Phone'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider with Arrow */}
                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-white p-2 rounded-full border shadow-sm flex items-center justify-center">
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Target Selection */}
                    <div
                        className={`p-4 rounded-xl border-2 transition-all ${targetProfile ? 'border-emerald-100 bg-emerald-50/30' : 'border-dashed border-gray-200'}`}
                    >
                        <div className="flex items-center gap-2 mb-3 text-emerald-600">
                            <UserCheck className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Target Profile (To be kept)
                            </span>
                        </div>
                        <SearchableSelect
                            label=""
                            id="targetProfile"
                            options={profileOptions}
                            value={targetProfileId}
                            onValueChange={setTargetProfileId}
                            onSearch={fetchProfiles}
                            placeholder="Search primary profile..."
                        />
                        {targetProfile && (
                            <div className="mt-3 grid grid-cols-1 gap-2 text-[11px]">
                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <Hash className="w-3 h-3" />
                                    <span>System ID: #{targetProfile.id}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>
                                        ID Number:{' '}
                                        {targetProfile.IDNumber ||
                                            (targetProfile as any).idNumber ||
                                            'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="truncate">
                                        {targetProfile.email || 'No Email'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>
                                        {targetProfile.phoneNumber ||
                                            'No Phone'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {sourceProfile && targetProfile && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-sm text-gray-600">
                            Merging{' '}
                            <span className="font-bold text-gray-900">
                                {sourceProfile.fullName}
                            </span>{' '}
                            into{' '}
                            <span className="font-bold text-gray-900">
                                {targetProfile.fullName}
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </CustomDialog>
    );
}
