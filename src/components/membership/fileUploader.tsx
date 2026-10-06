'use client';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FileUploaderProps } from './types';

const FileUploader = ({
    label,
    onFileChange,
    hideLabel = false,
    value,
    labelClassName,
}: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(value ?? null);

    useEffect(() => {
        setPreview(value ?? null);
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            onFileChange(selectedFile);
        }
    };

    return (
        <div className="">
            {!hideLabel ? (
                <p className="text-sm font-medium text-[#111111] mb-2">
                    {label}
                </p>
            ) : null}
            <label
                className={cn(
                    'border-2 border-dashed border-[#804407] rounded-lg p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 hover:border-gray-600 min-h-[120px]',
                    labelClassName,
                )}
            >
                {preview ? (
                    <Image
                        src={preview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-md mb-2"
                        width={100}
                        height={100}
                    />
                ) : (
                    <ImageIcon className="text-[#661806]" size={28} />
                )}
                <p className="text-[#661806] font-normal text-sm">
                    {file ? file.name : `Upload ${label.split(' ')[1]}`}
                </p>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
};

export default FileUploader;
