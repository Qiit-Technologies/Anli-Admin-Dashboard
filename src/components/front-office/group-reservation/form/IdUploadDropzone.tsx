'use client';

import { ImageIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function IdUploadDropzone({
    file,
    onFile,
}: {
    file: File | null;
    onFile: (file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const dropped = e.dataTransfer.files?.[0];
                    if (dropped) onFile(dropped);
                }}
                className={cn(
                    'flex w-full items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-background px-4 py-3.5',
                    dragActive && 'border-orion-blue bg-orion-blue/5',
                )}
            >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-500 text-white">
                    <ImageIcon className="size-4" />
                </span>
                {file ? (
                    <span className="truncate text-xs font-medium text-foreground">
                        {file.name}
                    </span>
                ) : (
                    <span className="text-center leading-tight">
                        <span className="block text-xs text-muted-foreground">
                            Drag and drop image here or{' '}
                            <span className="font-medium text-hexbrand">
                                browse
                            </span>
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                            (Accepted file format is .CSV)
                        </span>
                    </span>
                )}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept=".csv,image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
        </>
    );
}
