'use client';

import { updateBanquetMenuPackage } from '@/app/actions/banquet-menu-package';
import MenuPackageThumbnail from '@/components/banquest/menu/MenuPackageThumbnail';
import { MenuCategory } from '@/components/banquest/menu/types';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import useImageUpload from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';
import { ImagePlus, LoaderCircle, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';

export default function MenuPackageImageEdit({
    packageId,
    category,
    imageUrl,
    size = 'lg',
    layout = 'stacked',
}: {
    packageId: number;
    category: MenuCategory;
    imageUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
    /** stacked = thumbnail + button below; inline = compact row */
    layout?: 'stacked' | 'inline';
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { uploadImage, isLoading: uploading } = useImageUpload();
    const { mutate } = useSWRConfig();
    const [currentUrl, setCurrentUrl] = useState(imageUrl);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setCurrentUrl(imageUrl);
    }, [imageUrl]);

    const busy = uploading || saving;
    const invalidId = !Number.isFinite(packageId);

    const openPicker = () => {
        if (!busy && !invalidId) {
            inputRef.current?.click();
        }
    };

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/') || invalidId) return;

        setSaving(true);
        try {
            const url = await uploadImage(file);
            if (!url) return;

            const result = await updateBanquetMenuPackage(packageId, {
                imageUrl: url,
            });

            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={result.error}
                        type="error"
                    />
                ));
                return;
            }

            setCurrentUrl(url);
            await mutate(`/banquet/menu-packages/${packageId}`);
            await mutate('/banquet/menu-packages');

            toast.custom(() => (
                <Toast
                    title="Image updated"
                    description="Package image saved successfully."
                    type="success"
                />
            ));
        } finally {
            setSaving(false);
        }
    };

    const editButton = (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || invalidId}
            onClick={openPicker}
            className={cn(
                'border-orion-blue text-orion-blue hover:bg-orion-blue/5',
                layout === 'inline' && 'h-9',
            )}
        >
            {busy ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Pencil className="mr-2 h-3.5 w-3.5" />
            )}
            {busy ? 'Saving…' : 'Edit image'}
        </Button>
    );

    if (layout === 'inline') {
        return (
            <>
                {editButton}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFile(file);
                        e.target.value = '';
                    }}
                />
            </>
        );
    }

    return (
        <div className="flex shrink-0 flex-col items-center gap-2">
            <button
                type="button"
                disabled={busy || invalidId}
                onClick={openPicker}
                className={cn(
                    'group relative rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orion-blue',
                    (busy || invalidId) && 'pointer-events-none opacity-70',
                )}
                aria-label="Edit package image"
            >
                <MenuPackageThumbnail
                    category={category}
                    imageUrl={currentUrl}
                    size={size}
                />
                <span
                    className={cn(
                        'absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 rounded-b-xl bg-black/55 py-2 text-xs font-medium text-white',
                        'opacity-100 transition group-hover:bg-black/65',
                    )}
                >
                    {busy ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <ImagePlus className="h-3.5 w-3.5" />
                    )}
                    Change photo
                </span>
            </button>

            {editButton}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
}
