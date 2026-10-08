'use client';

import { submitCareerApplication } from '@/app/actions/career';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CheckCircle, Upload, XCircle } from 'lucide-react';
import React, { useState } from 'react';

interface CareerApplicationFormProps {
    positionTitle: string;
}

export default function CareerApplicationForm({
    positionTitle,
}: CareerApplicationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        portfolioUrl: '',
        currentLocation: '',
        projectExperience: '',
        motivation: '',
        availability: '',
    });
    const [cvFile, setCvFile] = useState<File | null>(null);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setCvFile(file);
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let availability = '';
        switch (value) {
            case '1':
                availability = 'Immediately';
                break;
            case '2':
                availability = 'Not available';
                break;
            case '3':
                availability = 'Maybe';
                break;
        }
        setFormData((prev) => ({ ...prev, availability }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            if (
                !formData.firstName ||
                !formData.email ||
                !formData.phone ||
                !cvFile
            ) {
                setMessage({
                    type: 'error',
                    text: 'Please fill in all required fields and upload your CV.',
                });
                setIsSubmitting(false);
                return;
            }

            const submitData = new FormData();
            submitData.append('fullName', formData.firstName);
            submitData.append('email', formData.email);
            submitData.append('positionId', 'temp-id');
            submitData.append('positionTitle', positionTitle);
            submitData.append('linkedinUrl', formData.linkedinUrl || '');
            submitData.append('portfolioUrl', formData.portfolioUrl || '');
            submitData.append('currentLocation', formData.currentLocation);
            submitData.append('projectExperience', formData.projectExperience);
            submitData.append('whyAnli', formData.motivation);

            let availabilityValue = 'negotiable';
            switch (formData.availability) {
                case 'Immediately':
                    availabilityValue = 'immediate';
                    break;
                case 'Not available':
                    availabilityValue = 'negotiable';
                    break;
                case 'Maybe':
                    availabilityValue = 'negotiable';
                    break;
            }
            submitData.append('availability', availabilityValue);
            submitData.append('cv', cvFile);

            const result = await submitCareerApplication(submitData);

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({
                    type: 'success',
                    text: "Application submitted successfully! We'll be in touch soon.",
                });
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    linkedinUrl: '',
                    portfolioUrl: '',
                    currentLocation: '',
                    projectExperience: '',
                    motivation: '',
                    availability: '',
                });
                setCvFile(null);
                const fileInput = document.querySelector(
                    'input[type="file"]',
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: 'An unexpected error occurred. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            {message && (
                <div
                    className={cn(
                        'mb-6 flex items-center gap-2 p-4 rounded-e-lg',
                        message.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-red-200 bg-red-50 text-red-800',
                    )}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    <div className="font-medium">{message.text}</div>
                </div>
            )}

            <Card>
                <CardContent className="p-8 shadow-none">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="firstName"
                                className="text-sm font-medium text-foreground"
                            >
                                Full Name{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="h-11"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Email{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="your.email@example.com"
                                    className="h-11"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Phone{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 123-4567"
                                    className="h-11"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="linkedinUrl"
                                    className="text-sm font-medium text-foreground"
                                >
                                    LinkedIn URL
                                </Label>
                                <Input
                                    id="linkedinUrl"
                                    type="url"
                                    name="linkedinUrl"
                                    value={formData.linkedinUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="portfolioUrl"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Portfolio URL
                                </Label>
                                <Input
                                    id="portfolioUrl"
                                    type="url"
                                    name="portfolioUrl"
                                    value={formData.portfolioUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://yourportfolio.com"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="currentLocation"
                                className="text-sm font-medium text-foreground"
                            >
                                Current Location
                            </Label>
                            <Input
                                id="currentLocation"
                                type="text"
                                name="currentLocation"
                                value={formData.currentLocation}
                                onChange={handleInputChange}
                                placeholder="City, State/Country"
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="cv"
                                className="text-sm font-medium text-foreground"
                            >
                                Upload Your CV{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="cv"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                                    required
                                />
                                {cvFile && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Upload className="h-4 w-4" />
                                        <span>{cvFile.name}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Accepted formats: PDF, DOC, DOCX (max 10MB)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="projectExperience"
                                className="text-sm font-medium text-foreground"
                            >
                                Project Experience
                            </Label>
                            <p className="text-sm text-muted-foreground mb-2">
                                What&apos;s a project or challenge you enjoyed
                                working on? Why was it meaningful, and how does
                                that experience align with a role in hospitality
                                tech?
                            </p>
                            <Textarea
                                id="projectExperience"
                                name="projectExperience"
                                value={formData.projectExperience}
                                onChange={handleInputChange}
                                placeholder="Describe a meaningful project and its relevance to hospitality tech..."
                                className="min-h-[120px] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="motivation"
                                className="text-sm font-medium text-foreground"
                            >
                                Why Anli?
                            </Label>
                            <p className="text-sm text-muted-foreground mb-2">
                                Why are you interested in working at Anli, and
                                what excites you about this role?
                            </p>
                            <Textarea
                                id="motivation"
                                name="motivation"
                                value={formData.motivation}
                                onChange={handleInputChange}
                                placeholder="Share what excites you about this opportunity..."
                                className="min-h-[120px] resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-foreground">
                                Availability to start?
                            </Label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="availability"
                                        value="1"
                                        onChange={handleRadioChange}
                                        className="h-4 w-4 text-[var(--hexbrand,#3b82f6)] focus:ring-2 focus:ring-[var(--hexbrand,#3b82f6)] focus:ring-offset-2 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-foreground group-hover:text-foreground/80">
                                        Immediately
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="availability"
                                        value="2"
                                        onChange={handleRadioChange}
                                        className="h-4 w-4 text-[var(--hexbrand,#3b82f6)] focus:ring-2 focus:ring-[var(--hexbrand,#3b82f6)] focus:ring-offset-2 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-foreground group-hover:text-foreground/80">
                                        Not available
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="availability"
                                        value="3"
                                        onChange={handleRadioChange}
                                        className="h-4 w-4 text-[var(--hexbrand,#3b82f6)] focus:ring-2 focus:ring-[var(--hexbrand,#3b82f6)] focus:ring-offset-2 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-foreground group-hover:text-foreground/80">
                                        Maybe
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 text-base font-medium bg-[var(--hexbrand,#3b82f6)] hover:bg-[var(--hexbrand,#3b82f6)]/90 text-white transition-colors"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Submitting Application...
                                    </div>
                                ) : (
                                    'Submit Application'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
