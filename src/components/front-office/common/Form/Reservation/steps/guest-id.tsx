/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputField } from '@/components/common/Form';
import React, { Dispatch, useRef } from 'react';
import { FormColumn } from '../components';
import { UploadCloud } from 'lucide-react';
import { getFileType } from '@/lib/utils';

export function GuestID({
    inputClass,
    IDNumber,
    setIDNumber,
    selectedFile,
    setSelectedFile,
    imagePreview,
    setImagePreview,
}: {
    inputClass: string;
    IDNumber: string;
    setIDNumber: Dispatch<React.SetStateAction<string>>;
    selectedFile: File | undefined;
    setSelectedFile: Dispatch<React.SetStateAction<File | undefined>>;
    imagePreview: string | undefined;
    setImagePreview: Dispatch<React.SetStateAction<string | undefined>>;
}) {
    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDocumentClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col gap-4">
            <FormColumn>
                <InputField
                    id="IDNumber"
                    name="IDNumber"
                    label="ID Number"
                    className={inputClass}
                    value={IDNumber}
                    onChange={(e) => {
                        setIDNumber(e.target.value);
                    }}
                    placeholder={'Enter guest ID number'}
                />
            </FormColumn>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Document Upload
                </label>
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={handleDocumentClick}
                >
                    {imagePreview ? (
                        <div className="flex flex-col items-center">
                            {selectedFile &&
                            getFileType(selectedFile?.name) !==
                                'image' ? null : (
                                <img
                                    src={imagePreview}
                                    alt="Uploaded document"
                                    className="w-32 h-32 object-cover rounded-lg mb-2"
                                />
                            )}
                            <p
                                onClick={() =>
                                    window.open(imagePreview, '_blank')
                                }
                                className="cursor-pointer text-sm font-semibold text-gray-600"
                            >
                                Document uploaded: {selectedFile?.name}
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
                                Accepted file formats: PDF, DOCX, JPG, PNG
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
    );
}
