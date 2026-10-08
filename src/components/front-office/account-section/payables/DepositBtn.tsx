/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { ARAPRow } from '../common/ARAPColumns';
import { DepositCreditDialog } from '@/components/front-office/DepositCreditDialog';
import type { GuestProfile } from '@/app/actions/guest-profile';
import { mutate } from 'swr';

export const DepositBtn = ({ selected }: { selected: ARAPRow | null }) => {
    const [open, setOpen] = useState(false);

    // Convert ARAPRow to GuestProfile format for DepositCreditDialog
    const profile: GuestProfile | null = selected
        ? {
              id: selected.guestId || 0,
              fullName: selected.fullName,
              email: selected.email,
              phoneNumber: selected.phoneNumber,
              address: selected.address,
              IDNumber: selected.IDNumber,
              nationality: selected.nationality,
              gender: selected.gender,
              dateOfBirth: selected.dateOfBirth
                  ? typeof selected.dateOfBirth === 'string'
                      ? selected.dateOfBirth
                      : selected.dateOfBirth.toISOString().split('T')[0]
                  : undefined,
              notes: undefined,
              creditAccounts: [],
              guestBookings: [],
              createdAt: selected.createdAt
                  ? typeof selected.createdAt === 'string'
                      ? selected.createdAt
                      : selected.createdAt.toISOString()
                  : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
          }
        : null;

    const handleSuccess = async () => {
        // Refresh the payables list after successful deposit
        await mutate('/accounts/payables');
        setOpen(false);
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                disabled={!selected}
            >
                Deposit
            </Button>
            <DepositCreditDialog
                open={open}
                onOpenChange={setOpen}
                profile={profile}
                onSuccess={handleSuccess}
            />
        </>
    );
};

