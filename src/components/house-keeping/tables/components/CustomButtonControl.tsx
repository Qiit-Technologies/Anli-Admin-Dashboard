'use client';

import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { mutate } from 'swr';
interface CustomButtonControlProps {
    onClick: () => Promise<any>;
    title: string;
    loadingText?: string;
    disabled?: boolean;
    className?: string;
    successMessage?: string;
    width?: string;
    mutateKey?: string;
}

const CustomButtonControl: React.FC<CustomButtonControlProps> = ({
    onClick,
    title,
    loadingText = 'Updating...',
    disabled = false,
    className = '',
    successMessage,
    width = 'w-[100px]',
    mutateKey,
}) => {
    const [loading, setLoading] = useState<boolean>(false);

    const showErrorToast = (message: string) => {
        toast.custom(() => (
            <Toast title="Error!" description={message} type="error" />
        ));
    };

    const showSuccessToast = (message: string) => {
        toast.custom(() => (
            <Toast title="Success!" description={message} type="success" />
        ));
    };

    const handleClick = async () => {
        if (loading || disabled) return;

        setLoading(true);

        try {
            const response = await onClick();

            if (response?.error) {
                showErrorToast(response.error);
                return;
            }

            showSuccessToast(
                successMessage ||
                    response?.message ||
                    'Operation completed successfully',
            );

            if (mutateKey) {
                await mutate(mutateKey);
            }
        } catch (error: any) {
            showErrorToast(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            onClick={handleClick}
            disabled={disabled || loading}
            className={`bg-orion-blue shadow-none hover:bg-orion-blue ${width} ${className}`}
        >
            {loading ? (
                <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>{loadingText}</span>
                </div>
            ) : (
                <span>{title}</span>
            )}
        </Button>
    );
};

export default CustomButtonControl;
