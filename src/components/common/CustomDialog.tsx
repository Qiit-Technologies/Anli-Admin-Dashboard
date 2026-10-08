'use client';
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import BrandButton from './Button';

interface CustomDialogProps {
    trigger?: React.ReactNode;
    title: string;
    description?: string;
    children?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    footerType?: 'default' | 'full' | 'none';
    confirmDisabled?: boolean;
    maxHeight?: string;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
    trigger,
    title,
    description,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
    open,
    onOpenChange,
    maxWidth = 'lg',
    footerType = 'default',
    confirmDisabled = false,
    maxHeight = '60vh',
}) => {
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else if (onOpenChange) {
            onOpenChange(false);
        }
    };

    const handleConfirm = () => {
        onConfirm();
    };

    const getMaxWidthClass = () => {
        switch (maxWidth) {
            case 'sm':
                return 'max-w-sm';
            case 'md':
                return 'max-w-md';
            case 'lg':
                return 'max-w-lg';
            case 'xl':
                return 'max-w-xl';
            case '2xl':
                return 'max-w-2xl';
            case '3xl':
                return 'max-w-3xl';
            case '4xl':
                return 'max-w-4xl';
            default:
                return 'max-w-lg';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className={`${getMaxWidthClass()}`}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                {children && (
                    <div
                        className="pb-4 overflow-y-auto scroll-container"
                        style={{ maxHeight }}
                    >
                        {children}
                    </div>
                )}

                {footerType !== 'none' && (
                    <DialogFooter>
                        {footerType == 'default' ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    {cancelText}
                                </Button>
                                <BrandButton
                                    onClick={handleConfirm}
                                    loading={isLoading}
                                    disabled={confirmDisabled}
                                >
                                    {confirmText}
                                </BrandButton>{' '}
                            </>
                        ) : (
                            <BrandButton
                                loading={isLoading}
                                onClick={handleConfirm}
                                className="w-full"
                                disabled={confirmDisabled}
                            >
                                {confirmText}
                            </BrandButton>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CustomDialog;
export { CustomDialog };
