'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ARAPType = 'receivables' | 'payables';

export default function ARAPToggle({ active }: { active: ARAPType }) {
    return (
        <div className="flex items-center gap-2">
            <Link href="/front-office/account-section/receivables">
                <Button
                    variant={active === 'receivables' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                        active === 'receivables' && 'pointer-events-none',
                    )}
                >
                    Accounts Receivable
                </Button>
            </Link>
            <Link href="/front-office/account-section/payables">
                <Button
                    variant={active === 'payables' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                        active === 'payables' && 'pointer-events-none',
                    )}
                >
                    Accounts Payable
                </Button>
            </Link>
        </div>
    );
}
