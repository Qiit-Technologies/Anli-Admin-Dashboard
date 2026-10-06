'use client';

import { useCallback, useState } from 'react';

export type FileUploadHookProps = {
    maxFiles?: number;
    maxSize?: number;
    accept?: string;
    onUpload?: (files: File[]) => void;
};

export const useFileUpload = ({
    maxFiles = Number.POSITIVE_INFINITY,
    maxSize = Number.POSITIVE_INFINITY,
    accept = '*',
    onUpload,
}: FileUploadHookProps = {}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFiles = useCallback(
        (newFiles: FileList | null) => {
            if (!newFiles) return;

            const validFiles = Array.from(newFiles).filter((file) => {
                if (file.size > maxSize) {
                    setError(`File ${file.name} is too large`);
                    return false;
                }
                if (accept !== '*' && !file.type.match(accept)) {
                    setError(`File ${file.name} is not an accepted file type`);
                    return false;
                }
                return true;
            });

            if (files.length + validFiles.length > maxFiles) {
                setError(`You can only upload a maximum of ${maxFiles} files`);
                return;
            }

            setFiles((prevFiles) => [...prevFiles, ...validFiles]);
            setError(null);
            if (onUpload) {
                onUpload(validFiles);
            }
        },
        [files, maxFiles, maxSize, accept, onUpload],
    );

    const removeFile = useCallback((index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
        setError(null);
    }, []);

    return { files, error, handleFiles, removeFile, clearFiles };
};
