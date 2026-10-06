'use client';

import { cacVerification } from '@/app/actions/hotel';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import React, { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { IoIosArrowRoundUp } from 'react-icons/io';
import Toast from '../toast';
import { Button } from '../ui/button';

type CertificateFormProps = {
    orgData: {
        certificate: File;
        taxId: string;
    };
    services: string[];
    updateFields: (
        fields: Partial<{
            orgData: { certificate: File; taxId: string };
            services: string[];
        }>,
    ) => void;
    isVerified: boolean;
    setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CertificateForm({
    orgData,
    services,
    updateFields,
    isVerified,
    setIsVerified,
}: CertificateFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const router = useRouter();

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            }

            updateFields({
                orgData: { ...orgData, certificate: file },
            });
        }
    };

    const handleTaxIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        updateFields({ orgData: { ...orgData, taxId: e.target.value } });
    };

    // const handleCacVerification = async () => {
    //     setLoading(true);
    //     try {
    //         let imageUrl = '';
    //         if (selectedImage) {
    //             const imageFormData = new FormData();
    //             imageFormData.append('file', selectedImage);
    //             imageFormData.append('upload_preset', 'anli_default');

    //             try {
    //                 const uploadResponse = await fetch(
    //                     'https://api.cloudinary.com/v1_1/dhkwjizxu/image/upload',
    //                     {
    //                         method: 'POST',
    //                         body: imageFormData,
    //                     },
    //                 );
    //                 const imageData = await uploadResponse.json();
    //                 imageUrl = imageData.secure_url;
    //             } catch (error: any) {
    //                 toast.custom(() => (
    //                     <Toast
    //                         title="Error!"
    //                         description="Image upload failed"
    //                         type="error"
    //                     />
    //                 ));
    //                 return;
    //             }
    //         }
    //         const response = await cacVerification(
    //             orgData.taxId,
    //             imageUrl,
    //             services,
    //         );
    //         console.log(response);
    //         if (response.message === 'Cac Verification Successful!') {
    //             setIsVerified(true);
    //             toast.custom(() => (
    //                 <Toast
    //                     title="Success!"
    //                     description={response.message}
    //                     type="success"
    //                 />
    //             ));
    //             setLoading(false);
    //             setTimeout(() => {
    //                 router.replace('/verification-notice');
    //             }, 2000);
    //         } else {
    //             toast.custom(() => (
    //                 <Toast
    //                     title="Error!"
    //                     description="Failed to verify CAC"
    //                     type="error"
    //                 />
    //             ));
    //         }
    //     } catch (e) {
    //         toast.custom(() => (
    //             <Toast
    //                 title="Error!"
    //                 description="Failed to verify CAC"
    //                 type="error"
    //             />
    //         ));
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleCacVerification = async () => {
        setLoading(true);
        try {
            let imageUrl = '';
            if (selectedImage) {
                const imageFormData = new FormData();
                imageFormData.append('file', selectedImage);
                imageFormData.append('upload_preset', 'anli_default');

                try {
                    const uploadResponse = await fetch(
                        'https://api.cloudinary.com/v1_1/dhkwjizxu/image/upload',
                        {
                            method: 'POST',
                            body: imageFormData,
                        },
                    );
                    const imageData = await uploadResponse.json();
                    imageUrl = imageData.secure_url;
                } catch (error: any) {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description="Image upload failed"
                            type="error"
                        />
                    ));
                    return;
                }
            }

            const response = await cacVerification(
                orgData.taxId,
                imageUrl,
                services,
            );

            if (response.message === 'Cac Verification Successful!') {
                setIsVerified(true);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                setLoading(false);
                setTimeout(() => {
                    router.replace('/signup/certification-request');
                }, 2000);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.message || 'Failed to verify CAC'}
                        type="error"
                    />
                ));
            }
        } catch (e) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="An unexpected error occurred during verification"
                    type="error"
                />
            ));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="max-w-xl w-full bg-white rounded-lg p-8">
                <img
                    src="/logos/lock.svg"
                    alt="Lock Icon"
                    className="w-6 h-6 place-self-center mb-4"
                />
                <h2 className="text-4xl font-semibold text-gray-800 text-center mb-4">
                    Verification Process
                </h2>
                <p className="text-gray-400 text-center mb-8 text-sm">
                    Here are the steps to verifying your organization profile
                    with Anli
                </p>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                        Certificate of Incorporation
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Provide Tax Identification Number
                    </p>

                    <div className="border-dashed border-[1px] border-gray-300 rounded-md p-4 mb-4 flex flex-col items-center">
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center text-center"
                        >
                            <img
                                src="/logos/paper-download.svg"
                                alt="Lock Icon"
                                className="w-6 h-6 place-self-center mb-4"
                            />
                            <span className="text-sm font-bold mb-2">
                                Drag and drop files here
                            </span>
                            <span className="text-sm text-gray-400">
                                Upload a PNG, JPEG, PDF format of your
                                organization Certificate
                            </span>
                            <div className="text-orion-blue flex items-center p-3 pl-6 pr-8 my-4 border-[1px] border-orion-blue rounded-md">
                                <IoIosArrowRoundUp className="w-6 h-6" />
                                <span className="text-sm">Upload</span>
                            </div>
                            <span className="text-xs text-gray-400">
                                max file size : 15 mb
                            </span>
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>

                    {orgData.certificate.name && (
                        <p className="text-sm text-green-600">
                            File Uploaded: {orgData.certificate.name}
                        </p>
                    )}
                </div>

                <div className="flex flex-col mb-4">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                        Certificate of Incorporation
                    </h3>
                    <span className="text-xs text-gray-400 mb-4">
                        Provide Tax Identification Number
                    </span>

                    <div className="flex w-full relative">
                        <input
                            type="text"
                            placeholder="Enter Tax ID number"
                            value={orgData.taxId}
                            onChange={handleTaxIdChange}
                            className="w-full pl-12 px-4 py-2 border text-lg font-thin border-gray-300 rounded-md"
                        />
                        <img
                            src="/logos/search.svg"
                            alt="Lock Icon"
                            className="w-5 h-5 absolute left-3 top-3 text-gray-400"
                        />
                    </div>

                    {!isVerified && (
                        <Button
                            disabled={loading}
                            variant={'outline'}
                            onClick={handleCacVerification}
                            className="border-orion-blue mt-6 hover:bg-orion-blue text-orion-blue hover:text-white font-semibold h-12 w-full"
                        >
                            {loading && <Loader2 className="aniamte-spin" />}
                            Continue
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
