'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import { uploadFileIllustration } from './illustrations';

export type FileUploaderProps = {
    className?: string;
    dragActiveClassName?: string;
    fileListClassName?: string;
    children?: React.ReactNode;
    illustration?: React.ReactNode;
    files: File[];
    error: string | null;
    handleFiles: (files: FileList | File[]) => void;
    removeFile: (index: number) => void;
    accept?: string;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
    className = '',
    dragActiveClassName = '',
    fileListClassName = '',
    children,
    illustration,
    files,
    error,
    handleFiles,
    removeFile,
    accept,
}) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="w-full">
            {files.length < 1 && (
                <div
                    className={`relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 transition-colors ${className} ${
                        dragActive ? dragActiveClassName : ''
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        onChange={handleChange}
                        accept={accept}
                        className="hidden"
                    />
                    {children || (
                        <div className="flex items-center flex-col gap-2 justify-center">
                            <div>{illustration}</div>
                            <div
                                role="heading"
                                className="mb-2 text-base text-gray-500"
                            >
                                Drag and drop your file here, or{' '}
                                <button
                                    className=" text-hexbrand"
                                    onClick={onButtonClick}
                                >
                                    browse
                                </button>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                Accepted file format is .CSV
                            </span>
                        </div>
                    )}
                </div>
            )}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            {files.length > 0 && (
                <ul className={`mt-4 space-y-2 ${fileListClassName}`}>
                    {files.map((file, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between rounded-md bg-[#EBF8FE] p-4"
                        >
                            <div className="flex items-center gap-2">
                                <div className="mr-3">
                                    {uploadFileIllustration}
                                </div>
                                <span className="text-base font-semibold truncate w-72">
                                    {file.name}
                                </span>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-hexbrand text-sm"
                            >
                                Change
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
