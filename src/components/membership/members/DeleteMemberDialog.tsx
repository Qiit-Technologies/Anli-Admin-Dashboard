'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Member } from '@/types/membership/membership';
import { Loader2 } from 'lucide-react';

type DeleteMemberDialogProps = {
    member: Member | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    isDeleting?: boolean;
    /** Referral deletes only remove the referred member; the principal is unchanged. */
    variant?: 'member' | 'referral';
};

export default function DeleteMemberDialog({
    member,
    open,
    onOpenChange,
    onConfirm,
    isDeleting = false,
    variant = 'member',
}: DeleteMemberDialogProps) {
    const fullName = member
        ? `${member.firstName} ${member.lastName}`.trim()
        : 'this member';
    const isReferral = variant === 'referral';
    const linkedReferralCount = member?.referredMembers?.length ?? 0;
    const hasLinkedReferrals = !isReferral && linkedReferralCount > 0;
    const principalName = member?.planOwner
        ? `${member.planOwner.firstName} ${member.planOwner.lastName}`.trim()
        : null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isReferral ? 'Delete referral?' : 'Delete member?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                You are about to remove{' '}
                                <strong className="text-foreground">
                                    {fullName}
                                </strong>{' '}
                                from membership records. This removes their
                                bookings, visits, and notification history. This
                                cannot be undone.
                            </p>
                            {isReferral && principalName && (
                                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                                    The principal member{' '}
                                    <strong>{principalName}</strong> will not be
                                    deleted or changed.
                                </p>
                            )}
                            {hasLinkedReferrals && (
                                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                                    This principal has{' '}
                                    <strong>{linkedReferralCount}</strong>{' '}
                                    linked referral
                                    {linkedReferralCount === 1 ? '' : 's'}.
                                    Delete those referrals on the Referrals page
                                    before removing the principal.
                                </p>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isDeleting || hasLinkedReferrals}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(event) => {
                            event.preventDefault();
                            void onConfirm();
                        }}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting…
                            </>
                        ) : isReferral ? (
                            'Delete referral'
                        ) : (
                            'Delete member'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
