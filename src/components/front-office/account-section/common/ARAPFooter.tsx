'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import type { ARAPRow } from './ARAPColumns';
import type { ARAPType } from './ARAPToggle';

interface ARAPFooterProps {
    type: ARAPType;
    runningBalance: number;
    onAdd: (row: ARAPRow) => void;
    onDelete: (accountNumber: string) => void;
    onUpdate: (accountNumber: string, changes: Partial<ARAPRow>) => void;
    onTransfer: (
        fromAccountNumber: string,
        toAccountNumber: string,
        amount: number,
    ) => void;
    onCancel?: () => void;
}

export default function ARAPFooter({
    type,
    runningBalance,
    onAdd,
    onDelete,
    onUpdate,
    onTransfer,
    onCancel,
}: ARAPFooterProps) {
    const [addOpen, setAddOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);

    // Add form state
    const [newRow, setNewRow] = useState<ARAPRow>({
        guestId: undefined,
        accountNumber: '',
        title: '',
        lastName: '',
        firstName: '',
        address: '',
        createdAt: new Date(),
        balance: 0,
        phoneNumber: '',
        gender: 'male',
        createdBy: 'FrontDesk',
        guestType: 'Regular',
    });

    // Delete form state
    const [deleteAccNo, setDeleteAccNo] = useState('');

    // Update form state
    const [updateAccNo, setUpdateAccNo] = useState('');
    const [updateBalanceDelta, setUpdateBalanceDelta] = useState<number>(0);

    // Transfer form state
    const [fromAccNo, setFromAccNo] = useState('');
    const [toAccNo, setToAccNo] = useState('');
    const [transferAmount, setTransferAmount] = useState<number>(0);

    return (
        <div className="w-full border-t bg-white px-4 py-3 flex flex-col md:flex-row gap-3 items-center justify-between sticky bottom-0">
            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    onClick={() => setSummaryOpen(true)}
                >
                    Summary
                </Button>
                <Button variant="outline" onClick={() => setTransferOpen(true)}>
                    Transfer
                </Button>
                <Button onClick={() => setAddOpen(true)}>Add</Button>
                <Button
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                >
                    Delete
                </Button>
                <Button variant="outline" onClick={() => setUpdateOpen(true)}>
                    Update
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
            <div className="text-sm">
                Running Balance:{' '}
                <span
                    className={
                        type === 'receivables'
                            ? 'text-emerald-700'
                            : 'text-red-700'
                    }
                >
                    {type === 'receivables'
                        ? formatCurrency(runningBalance)
                        : `-${formatCurrency(runningBalance)}`}
                </span>
            </div>

            {/* Summary Dialog */}
            <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {type === 'receivables'
                                ? 'Receivables Summary'
                                : 'Payables Summary'}
                        </DialogTitle>
                        <DialogDescription>
                            Overview of current{' '}
                            {type === 'receivables'
                                ? 'guest debts to hotel'
                                : 'hotel debts to guests'}
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span>Total Running Balance</span>
                            <span className="font-medium">
                                {type === 'receivables'
                                    ? formatCurrency(runningBalance)
                                    : `-${formatCurrency(runningBalance)}`}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setSummaryOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add{' '}
                            {type === 'receivables' ? 'Receivable' : 'Payable'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Account No</Label>
                            <Input
                                value={newRow.accountNumber}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        accountNumber: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label>Design</Label>
                            <Input
                                value={newRow.title ?? ''}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        title: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label>Surname</Label>
                            <Input
                                value={newRow.lastName}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        lastName: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label>Firstname</Label>
                            <Input
                                value={newRow.firstName}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        firstName: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="col-span-2">
                            <Label>Address</Label>
                            <Textarea
                                value={newRow.address}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        address: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input
                                value={newRow.phoneNumber}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        phoneNumber: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label>Sex</Label>
                            <Select
                                value={newRow.gender}
                                onValueChange={(val) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        gender: val as 'male' | 'female',
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">
                                        Female
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Created By</Label>
                            <Input
                                value={newRow.createdBy}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        createdBy: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label>Guest Type</Label>
                            <Input
                                value={newRow.guestType}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        guestType: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label>Creation Date</Label>
                            <Input
                                type="datetime-local"
                                value={new Date(newRow.createdAt)
                                    .toISOString()
                                    .slice(0, 16)}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        createdAt: new Date(e.target.value),
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label>
                                Balance ({type === 'receivables' ? '+' : '-'})
                            </Label>
                            <Input
                                type="number"
                                value={newRow.balance}
                                onChange={(e) =>
                                    setNewRow((r) => ({
                                        ...r,
                                        balance: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                onAdd({
                                    ...newRow,
                                    balance: Math.abs(newRow.balance),
                                });
                                setAddOpen(false);
                            }}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete{' '}
                            {type === 'receivables' ? 'Receivable' : 'Payable'}
                        </DialogTitle>
                        <DialogDescription>
                            Enter account number to delete.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <Label>Account No</Label>
                            <Input
                                value={deleteAccNo}
                                onChange={(e) => setDeleteAccNo(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onDelete(deleteAccNo);
                                setDeleteAccNo('');
                                setDeleteOpen(false);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Dialog */}
            <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Balance</DialogTitle>
                        <DialogDescription>
                            Enter account number and amount to adjust.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Label>Account No</Label>
                            <Input
                                value={updateAccNo}
                                onChange={(e) => setUpdateAccNo(e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label>
                                Amount ({type === 'receivables' ? '+' : '-'})
                            </Label>
                            <Input
                                type="number"
                                value={updateBalanceDelta}
                                onChange={(e) =>
                                    setUpdateBalanceDelta(
                                        Number(e.target.value),
                                    )
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                onUpdate(updateAccNo, {
                                    balance: Math.abs(updateBalanceDelta),
                                });
                                setUpdateAccNo('');
                                setUpdateBalanceDelta(0);
                                setUpdateOpen(false);
                            }}
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transfer Dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer</DialogTitle>
                        <DialogDescription>
                            Move amount between accounts.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>From Acc No</Label>
                            <Input
                                value={fromAccNo}
                                onChange={(e) => setFromAccNo(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>To Acc No</Label>
                            <Input
                                value={toAccNo}
                                onChange={(e) => setToAccNo(e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                value={transferAmount}
                                onChange={(e) =>
                                    setTransferAmount(Number(e.target.value))
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                onTransfer(
                                    fromAccNo,
                                    toAccNo,
                                    Math.abs(transferAmount),
                                );
                                setFromAccNo('');
                                setToAccNo('');
                                setTransferAmount(0);
                                setTransferOpen(false);
                            }}
                        >
                            Transfer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
