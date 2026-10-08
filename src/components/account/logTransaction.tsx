import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import { Input } from '../ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '../ui/select';

import { UploadCloud, X } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { createPettyCashTransaction } from '@/app/actions/account';
import { Button } from '../ui/button';
import useSWR from 'swr';
import { getAllBankAccounts } from '@/app/actions/bank-accounts';
// import { getDepartments } from '@/app/actions/department';
import { Textarea } from '@heroui/react';
import { getFileType } from '@/lib/utils';

interface LogTransactionModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSuccess?: () => void;
}

const allModules = [
    'Front Office',
    'Housekeeping',
    'Stock',
    'Bar',
    'Account',
    'Restaurant',
    'Kitchen',
    'Back Of House',
];

const LogTransaction: React.FC<LogTransactionModalProps> = ({
    isOpen,
    onOpenChange,
    onSuccess,
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        purpose: '',
        recipientName: '',
        paidFromId: '',
        departmentId: '',
        module: '',
        paymentMethod: '',
        description: '',
        documentUrl: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
    const [documentPreview, setDocumentPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: bankAccountsResponse } = useSWR(
        '/bank-accounts',
        getAllBankAccounts,
        {
            revalidateOnFocus: false,
        },
    );

    // const { data: departmentsResponse } = useSWR(
    //     '/departments',
    //     getDepartments,
    //     {
    //         revalidateOnFocus: false,
    //     },
    // );

    const bankAccounts = bankAccountsResponse || [];
    // const departments = departmentsResponse || [];

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedDocument(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocumentPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentUpload = async (): Promise<string> => {
        if (!selectedDocument) return '';

        const documentFormData = new FormData();
        documentFormData.append('file', selectedDocument);
        documentFormData.append('upload_preset', 'anli_default');

        try {
            const uploadResponse = await fetch(
                'https://api.cloudinary.com/v1_1/dhkwjizxu/image/upload',
                {
                    method: 'POST',
                    body: documentFormData,
                },
            );
            const documentData = await uploadResponse.json();
            return documentData.secure_url;
        } catch (error: any) {
            toast.error('Document upload failed');
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Upload document to Cloudinary if selected
            let documentUrl = '';
            if (selectedDocument) {
                documentUrl = await handleDocumentUpload();
            }

            const result = await createPettyCashTransaction({
                ...formData,
                amount: parseFloat(formData.amount),
                paidFromId: parseInt(formData.paidFromId),
                departmentId: parseInt(formData.departmentId),
                module: formData.module,
                documentUrl,
            });

            if (result.data) {
                toast.success('Transaction logged successfully!');
                onSuccess?.();
                onOpenChange(false);
                // Reset form
                setFormData({
                    amount: '',
                    purpose: '',
                    recipientName: '',
                    paidFromId: '',
                    departmentId: '',
                    module: '',
                    paymentMethod: '',
                    description: '',
                    documentUrl: '',
                });
                setSelectedDocument(null);
                setDocumentPreview(null);
            } else {
                toast.error(result.error || 'Failed to log transaction');
            }
        } catch (error: any) {
            console.error('Error logging transaction:', error);
            toast.error('Failed to log transaction');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDocumentClick = () => {
        fileInputRef.current?.click();
    };

    const isValid =
        formData.amount &&
        formData.purpose &&
        formData.recipientName &&
        formData.paidFromId &&
        formData.module &&
        formData.paymentMethod;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 space-y-0 gap-0">
                <DialogHeader className="sticky top-0 bg-white border-b border-gray-200 z-10 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <DialogTitle className="text-xl font-semibold text-gray-900">
                                    Log Transaction
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Record a new petty cash transaction
                                </DialogDescription>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} className="text-gray-400" />
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 pt-0">
                    <div className="w-full max-h-[60vh] overflow-y-scroll space-y-6 px-1">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Amount
                            </label>
                            <Input
                                type="number"
                                value={formData.amount}
                                onChange={(e) =>
                                    handleInputChange('amount', e.target.value)
                                }
                                placeholder="Enter Amount"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Recipient Name
                            </label>
                            <Input
                                type="text"
                                value={formData.recipientName}
                                onChange={(e) =>
                                    handleInputChange(
                                        'recipientName',
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter the name of who received it"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Department
                            </label>
                            <Select
                                value={formData.module}
                                onValueChange={(value) =>
                                    handleInputChange('module', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Module" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allModules.map((module: any) => (
                                        <SelectItem key={module} value={module}>
                                            {module}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Department
                        </label>
                        <Select
                            value={formData.departmentId}
                            onValueChange={(value) =>
                                handleInputChange('departmentId', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((department: any) => (
                                    <SelectItem
                                        key={department.id}
                                        value={department.id.toString()}
                                    >
                                        {department.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div> */}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Paid From
                            </label>
                            <Select
                                value={formData.paidFromId}
                                onValueChange={(value) =>
                                    handleInputChange('paidFromId', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Bank Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bankAccounts?.map((account: any) => (
                                        <SelectItem
                                            key={account.id}
                                            value={account.id?.toString() || ''}
                                        >
                                            {account.accountName} -{' '}
                                            {account.bankName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Payment Method
                            </label>
                            <Select
                                value={formData.paymentMethod}
                                onValueChange={(value) =>
                                    handleInputChange('paymentMethod', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Payment Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">
                                        Bank Transfer
                                    </SelectItem>
                                    <SelectItem value="mobile_money">
                                        Mobile Money
                                    </SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Purpose
                            </label>
                            <Textarea
                                type="text"
                                value={formData.purpose}
                                onChange={(e) =>
                                    handleInputChange('purpose', e.target.value)
                                }
                                placeholder="Enter purpose"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <Textarea
                                type="text"
                                value={formData.description}
                                onChange={(e) =>
                                    handleInputChange(
                                        'description',
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter description (optional)"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Document Upload
                            </label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                onClick={handleDocumentClick}
                            >
                                {documentPreview ? (
                                    <div className="flex flex-col items-center">
                                        {getFileType(selectedDocument?.name) ===
                                            'image' && (
                                            <img
                                                src={documentPreview}
                                                alt="Uploaded document"
                                                className="w-32 h-32 object-cover rounded-lg mb-2"
                                            />
                                        )}
                                        <p
                                            onClick={() =>
                                                window.open(
                                                    documentPreview,
                                                    '_blank',
                                                )
                                            }
                                            className="cursor-pointer text-sm font-semibold text-gray-600"
                                        >
                                            Document uploaded:{' '}
                                            {selectedDocument?.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                            <span className="text-blue-600 hover:underline cursor-pointer">
                                                browse
                                            </span>{' '}
                                            to upload document
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Accepted file formats: PDF, DOCX,
                                            JPG, PNG
                                        </p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                onChange={handleDocumentChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            className="bg-gray-200"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-orion-blue"
                            type="submit"
                            disabled={isLoading || !isValid}
                        >
                            {isLoading ? 'Saving...' : 'Save Transaction'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LogTransaction;
