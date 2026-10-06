'use client';

import {
    useRef,
    useState,
    type ChangeEvent,
    type ClipboardEvent,
    type DragEvent,
} from 'react';
import { IoImageOutline } from 'react-icons/io5';

interface ImageUploadProps {
    onImageUpload: (imageUrl: string) => void;
}
export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const applyImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageUrl = reader.result as string;
            setSelectedImage(imageUrl);
            onImageUpload(imageUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) applyImageFile(file);
    };

    const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData?.items;
        if (!items?.length) return;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind !== 'file' || !item.type.startsWith('image/')) {
                continue;
            }
            const file = item.getAsFile();
            if (file) {
                e.preventDefault();
                e.stopPropagation();
                applyImageFile(file);
                return;
            }
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) applyImageFile(file);
    };

    const handleCardClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="room-image" className="text-sm text-gray-500">
                Add Room Image (Optional)
            </label>
            <div
                role="button"
                tabIndex={0}
                className={`border border-gray-500 border-dashed rounded-lg p-8 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-hexbrand focus-visible:ring-offset-2 ${
                    isDragging ? 'bg-gray-50' : ''
                }`}
                onClick={handleCardClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onPaste={handlePaste}
            >
                <div className="flex flex-col items-center justify-center">
                    {selectedImage ? (
                        <img
                            src={selectedImage || '/placeholder.svg'}
                            alt="Uploaded room"
                            className="w-32 h-32 object-cover rounded-lg"
                        />
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100">
                                <IoImageOutline className="w-8 h-8 text-black" />
                            </div>
                            <h1 className="text-base font-semibold">
                                Drag and drop photo here,{' '}
                                <span className="text-hexbrand">browse</span>, or
                                paste (Ctrl+V)
                            </h1>
                            <span className="text-sm text-gray-500">
                                PNG, JPG, WebP and other common image formats
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <input
                ref={fileInputRef}
                id="room-image"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
}
