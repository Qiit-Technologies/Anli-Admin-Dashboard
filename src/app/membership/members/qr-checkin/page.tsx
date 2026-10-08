'use client';

import {
    checkInMember,
    getFacilities,
    validateQRCode,
} from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CheckInPanel from '@/components/membership/qr-scanner/CheckInPanel';
import MemberScanResult, {
    ScanMemberData,
} from '@/components/membership/qr-scanner/MemberScanResult';
import { qrCheckInToast } from '@/components/membership/qr-scanner/qr-checkin-toast';
import QRScanner from '@/components/membership/qr-scanner/QRScanner';
import {
    formatReferralCode,
    getDaysUntilMembershipExpiry,
    isMembershipExpiringSoon,
} from '@/lib/membership/member-utils';
import { Facility } from '@/types/membership/membership';
import { CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

interface QRValidationResult {
    isValid: boolean;
    member?: ScanMemberData;
    accessibleFacilities?: Facility[];
    error?: string;
}

function mapMemberFromApi(memberData: Record<string, unknown>): ScanMemberData {
    const isExpired =
        Boolean(memberData.isExpired) || memberData.status === 'expired';
    const daysUntilExpiry =
        (memberData.daysUntilExpiry as number | null | undefined) ??
        getDaysUntilMembershipExpiry(memberData.endDate as string | undefined);
    const isExpiringSoon =
        (memberData.isExpiringSoon as boolean | undefined) ??
        (!isExpired &&
            isMembershipExpiringSoon(memberData.endDate as string | undefined));

    const firstName = String(memberData.firstName ?? '');
    const lastName = String(memberData.lastName ?? '');

    return {
        id: String(memberData.id),
        name: `${firstName} ${lastName}`.trim() || 'Unknown Member',
        email: String(memberData.email ?? ''),
        phone: String(memberData.phone ?? ''),
        photoUrl: String(memberData.photoUrl ?? ''),
        status: String(memberData.status ?? 'active'),
        membershipTier: String(memberData.membershipTier ?? ''),
        startDate: String(memberData.startDate ?? ''),
        endDate: String(memberData.endDate ?? ''),
        dateOfBirth: String(memberData.dateOfBirth ?? ''),
        nationality: String(memberData.nationality ?? ''),
        occupation: String(memberData.occupation ?? ''),
        totalSpend: Number(memberData.totalSpend ?? 0),
        totalVisits: Number(memberData.totalVisits ?? 0),
        totalBookings: Number(memberData.totalBookings ?? 0),
        lastVisitDate: String(memberData.lastVisitDate ?? ''),
        lastServiceUsed: String(memberData.lastServiceUsed ?? ''),
        isExpired,
        isExpiringSoon,
        daysUntilExpiry,
        plan: (memberData.plan as ScanMemberData['plan']) ?? null,
        referralTier:
            (memberData.referralTier as ScanMemberData['referralTier']) ?? null,
        isReferral: Boolean(memberData.isReferral),
        referralCode:
            (memberData.referralCode as string | null) ||
            (memberData.isReferral
                ? formatReferralCode(String(memberData.id))
                : null),
        planOwner:
            (memberData.planOwner as ScanMemberData['planOwner']) ?? null,
    };
}

const QRCheckInPage = () => {
    const [qrCode, setQrCode] = useState('');
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
        null,
    );
    const [purposeOfVisit, setPurposeOfVisit] = useState('');
    const [notes, setNotes] = useState('');
    const [validationResult, setValidationResult] =
        useState<QRValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkInSuccess, setCheckInSuccess] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [successMeta, setSuccessMeta] = useState<{
        memberName: string;
        facilityName: string;
    } | null>(null);

    // Warm facility list cache so the picker is ready if validation omits facilities.
    useSWR('/api/facilities', getFacilities, {
        revalidateOnFocus: false,
        dedupingInterval: 60_000,
    });

    useEffect(() => {
        if (isValidating) {
            qrCheckInToast.showValidating();
        } else if (isScanning) {
            qrCheckInToast.showHoldSteady();
        } else {
            qrCheckInToast.dismissProgress();
        }

        return () => {
            qrCheckInToast.dismissProgress();
        };
    }, [isScanning, isValidating]);

    const syncFacilityForMember = useCallback(
        (facilities: Facility[] | undefined, current: Facility | null) => {
            if (!facilities?.length) return current;
            if (current && facilities.some((f) => f.id === current.id)) {
                return current;
            }
            return null;
        },
        [],
    );

    const handleQRValidation = useCallback(
        async (qrCodeValue: string) => {
            if (!qrCodeValue.trim()) return;

            setIsValidating(true);
            setValidationResult(null);

            try {
                const result = await validateQRCode(qrCodeValue);
                const validationData = result.data?.data ?? result.data;

                if (!result.success || !validationData) {
                    const message = result.message || 'Invalid QR code';
                    setValidationResult({ isValid: false, error: message });
                    qrCheckInToast.invalid(message);
                    return;
                }

                const memberData = validationData.member;
                if (!memberData) {
                    const message = result.message || 'Invalid QR code';
                    setValidationResult({ isValid: false, error: message });
                    qrCheckInToast.invalid(message);
                    return;
                }

                const member = mapMemberFromApi(
                    memberData as Record<string, unknown>,
                );
                const accessibleFacilities =
                    (validationData.accessibleFacilities as Facility[]) || [];
                const isValid = Boolean(validationData.valid);

                setValidationResult({
                    isValid,
                    member,
                    accessibleFacilities,
                });

                setSelectedFacility((prev) =>
                    syncFacilityForMember(accessibleFacilities, prev),
                );

                if (isValid) {
                    if (member.isExpiringSoon && member.daysUntilExpiry) {
                        qrCheckInToast.expiringSoon(member.daysUntilExpiry);
                    } else {
                        qrCheckInToast.validated(member.name);
                    }
                } else {
                    const statusMessage =
                        member.isExpired || member.status === 'expired'
                            ? 'expired'
                            : member.status === 'suspended'
                              ? 'suspended'
                              : member.status === 'inactive'
                                ? 'inactive'
                                : 'not active';
                    qrCheckInToast.statusBlocked(statusMessage);
                }
            } catch {
                const message = 'Failed to validate QR code. Please try again.';
                setValidationResult({ isValid: false, error: message });
                qrCheckInToast.invalid(message);
            } finally {
                qrCheckInToast.dismissProgress();
                setIsValidating(false);
            }
        },
        [syncFacilityForMember],
    );

    const handleScanSuccess = useCallback(
        (decodedText: string) => {
            setQrCode(decodedText);
            void handleQRValidation(decodedText);
        },
        [handleQRValidation],
    );

    const handleScanError = useCallback((error: string) => {
        qrCheckInToast.scannerError(error);
    }, []);

    const handleCheckIn = async () => {
        if (
            !validationResult?.isValid ||
            !validationResult.member ||
            !selectedFacility
        ) {
            qrCheckInToast.missingFields(
                'Validate a member and select a facility first.',
            );
            return;
        }

        setIsCheckingIn(true);
        try {
            const result = await checkInMember({
                memberId: validationResult.member.id,
                facilityId: selectedFacility.id,
                checkInType: 'qr_code',
                purposeOfVisit: purposeOfVisit || 'General Access',
                notes: notes || '',
                qrCode,
            });

            if (result.success) {
                setSuccessMeta({
                    memberName: validationResult.member.name,
                    facilityName: selectedFacility.name,
                });
                setCheckInSuccess(true);
                qrCheckInToast.checkedIn(
                    `${validationResult.member.name} · ${selectedFacility.name}`,
                );
            } else {
                qrCheckInToast.invalid(
                    result.message || 'Check-in failed. Please try again.',
                );
            }
        } catch {
            qrCheckInToast.invalid('Check-in failed. Please try again.');
        } finally {
            setIsCheckingIn(false);
        }
    };

    const resetForm = (restartCamera = false) => {
        setQrCode('');
        setSelectedFacility(null);
        setPurposeOfVisit('');
        setNotes('');
        setValidationResult(null);
        setCheckInSuccess(false);
        setSuccessMeta(null);
        if (restartCamera) {
            setIsScanning(true);
        }
    };

    if (checkInSuccess && successMeta) {
        return (
            <PageWrapper>
                <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-6">
                    <div className="w-full rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                            <CheckCircle className="h-9 w-9 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Checked in
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-gray-900">
                                {successMeta.memberName}
                            </span>{' '}
                            is now at{' '}
                            <span className="font-medium text-gray-900">
                                {successMeta.facilityName}
                            </span>
                        </p>
                        <BrandButton
                            onClick={() => resetForm(true)}
                            className="mt-6 w-full"
                        >
                            Scan next member
                        </BrandButton>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    const showCheckIn =
        validationResult?.member &&
        (validationResult.isValid || !validationResult.isValid);

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    hasBack
                    title="QR Check-In"
                    subtitle="Scan member QR codes for fast facility access"
                />
            </PageHeader>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-1 pb-6 pt-1 sm:gap-5 sm:px-0 sm:py-2 lg:grid-cols-2 lg:gap-6">
                <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                    <QRScanner
                        onScanSuccess={handleScanSuccess}
                        onScanError={handleScanError}
                        isScanning={isScanning}
                        onToggleScanning={() => setIsScanning((v) => !v)}
                        isValidating={isValidating}
                        lastScanLabel={validationResult?.member?.name ?? null}
                    />
                </div>

                <div className="min-w-0 space-y-4">
                    <MemberScanResult
                        member={validationResult?.member}
                        isValid={validationResult?.isValid ?? false}
                        error={validationResult?.error}
                        isLoading={isValidating}
                    />

                    {showCheckIn && validationResult?.member ? (
                        <CheckInPanel
                            member={validationResult.member}
                            isValid={validationResult.isValid}
                            selectedFacility={selectedFacility}
                            onFacilitySelect={setSelectedFacility}
                            accessibleFacilities={
                                validationResult.accessibleFacilities
                            }
                            purposeOfVisit={purposeOfVisit}
                            onPurposeChange={setPurposeOfVisit}
                            notes={notes}
                            onNotesChange={setNotes}
                            onCheckIn={handleCheckIn}
                            isCheckingIn={isCheckingIn}
                        />
                    ) : null}
                </div>
            </div>
        </PageWrapper>
    );
};

export default QRCheckInPage;
