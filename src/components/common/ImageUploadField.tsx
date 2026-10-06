'use client';

import useImageUpload from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';
import { ImageIcon, LoaderCircle, X } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

export interface ImageUploadFieldProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
    className?: string;
    dropzoneClassName?: string;
    thumbnailClassName?: string;
    hint?: string;
    disabled?: boolean;
}

export default function ImageUploadField({
    images,
    onChange,
    maxImages = 6,
    className,
    dropzoneClassName,
    thumbnailClassName,
    hint = 'Drag and drop images here or browse',
    disabled = false,
}: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { uploadImage, isLoading } = useImageUpload();

    const canAdd = images.length < maxImages && !disabled;

    const handleFiles = async (files: FileList | File[]) => {
        const list = Array.from(files).filter((f) =>
            f.type.startsWith('image/'),
        );
        if (!list.length) return;

        const slots = maxImages - images.length;
        const toUpload = list.slice(0, slots);
        const uploaded: string[] = [];

        for (const file of toUpload) {
            const url = await uploadImage(file);
            if (url) uploaded.push(url);
        }

        if (uploaded.length) {
            onChange([...images, ...uploaded].slice(0, maxImages));
        }
    };

    const removeAt = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    return (
        <div className={cn('flex flex-wrap items-start gap-4', className)}>
            {canAdd ? (
                <label
                    className={cn(
                        'flex min-h-[120px] min-w-[200px] flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 transition hover:border-hexbrand/50',
                        (isLoading || disabled) &&
                            'pointer-events-none opacity-60',
                        dropzoneClassName,
                    )}
                >
                    {isLoading ? (
                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <ImageIcon className="h-8 w-8 text-gray-500" />
                    )}
                    <p className="mt-3 text-center text-sm text-gray-600">
                        {hint}{' '}
                        <span className="font-medium text-hexbrand">
                            browse
                        </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Up to {maxImages} images · JPG, PNG, WebP
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={isLoading || disabled}
                        onChange={(e) => {
                            const files = e.target.files;
                            if (files?.length) void handleFiles(files);
                            e.target.value = '';
                        }}
                    />
                </label>
            ) : null}

            {images.map((src, i) => (
                <div
                    key={`${src}-${i}`}
                    className={cn(
                        'group relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100',
                        thumbnailClassName,
                    )}
                >
                    <Image
                        src={src}
                        alt={`Upload ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                    />
                    {!disabled ? (
                        <button
                            type="button"
                            onClick={() => removeAt(i)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                            aria-label="Remove image"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
