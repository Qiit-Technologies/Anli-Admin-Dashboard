'use client';
import BrandButton from '@/components/common/Button';
import useImageUpload from '@/hooks/useImageUpload';
import useMemberOnboardingStore from '@/store/useMemberOnboardingStore';
import React from 'react';
import FileUploader from '../fileUploader';

const IdentityVerification: React.FC = () => {
    const {
        nextStep,
        setPrincipalMemberField,
        setStepValidation,
        validateCurrentStep,
        principalMember,
    } = useMemberOnboardingStore();

    const { uploadImage, isLoading } = useImageUpload();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateCurrentStep();
        setStepValidation(1, isValid);
        if (isValid) {
            nextStep();
        }
    };

    const handleLogoUpload = async (file: File | null) => {
        if (file) {
            try {
                const url = await uploadImage(file);
                if (url) {
                    setPrincipalMemberField('photoUrl', url);
                } else {
                    console.error('Photo upload failed - no URL returned');
                }
            } catch (error: any) {
                console.error('Photo upload error:', error);
            }
        }
    };

    const handleDocUpload = async (file: File | null) => {
        if (file) {
            try {
                const url = await uploadImage(file);
                if (url) {
                    setPrincipalMemberField('identificationUrl', url);
                } else {
                    console.error('Document upload failed - no URL returned');
                }
            } catch (error: any) {
                console.error('Document upload error:', error);
            }
        }
    };

    const canProceed =
        principalMember.photoUrl && principalMember.identificationUrl;

    return (
        <form className="space-y-6 sm:w-[600px]" onSubmit={handleSubmit}>
            <FileUploader
                label="Photo ID Upload"
                onFileChange={handleLogoUpload}
            />
            {principalMember.photoUrl && (
                <div className="text-green-600 text-sm">
                    ✓ Photo uploaded successfully
                </div>
            )}

            <FileUploader
                label="File upload (Eg passport or any accepted ID)"
                onFileChange={handleDocUpload}
            />
            {principalMember.identificationUrl && (
                <div className="text-green-600 text-sm">
                    ✓ Document uploaded successfully
                </div>
            )}

            <BrandButton
                type="submit"
                className="w-full bg-[#007BFF] hover:bg-blue-600 text-white py-3 h-12 rounded-md font-medium"
                disabled={!canProceed || isLoading}
            >
                {isLoading ? 'Uploading...' : 'Continue'}
            </BrandButton>
        </form>
    );
};

export default IdentityVerification;
