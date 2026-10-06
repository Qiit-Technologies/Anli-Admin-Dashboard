'use client';

import { InputField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface RegisterFormProps {
    eventTitle: string;
    eventDate: string;
}

export default function RegisterForm({
    eventTitle,
    eventDate,
}: Readonly<RegisterFormProps>) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        description: '',
    });

    React.useEffect(() => {
        const registeredEvents = JSON.parse(
            localStorage.getItem('registeredEvents') ?? '{}',
        );
        setIsRegistered(!!registeredEvents[eventTitle]);
    }, [eventTitle]);

    const generateDescription = (userData: typeof formData) => {
        return `${userData.name} registered for ${eventTitle} event scheduled for ${eventDate}. Contact: ${userData.email} / ${userData.phone}${userData.company ? ` (${userData.company})` : ''}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const description = generateDescription(formData);
            const response = await fetch('https://formspree.io/f/xanjowqn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    eventTitle,
                    eventDate,
                    description,
                }),
            });

            if (response.ok) {
                const registeredEvents = JSON.parse(
                    localStorage.getItem('registeredEvents') || '{}',
                );
                registeredEvents[eventTitle] = true;
                localStorage.setItem(
                    'registeredEvents',
                    JSON.stringify(registeredEvents),
                );
                setIsRegistered(true);

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="You have been registered for the event."
                        type="success"
                    />
                ));
                setOpenDialog(false);
            } else {
                throw new Error('Failed to register');
            }
        } catch (error: any) {
            console.log(error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Failed to register. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
                <Button
                    className={`mt-8 w-full md:w-fit group relative overflow-hidden transition-all duration-300 ${
                        isRegistered
                            ? 'bg-emerald-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-hexbrand to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    } shadow-lg hover:shadow-xl ${!isRegistered && 'active:scale-95'}`}
                    disabled={isRegistered}
                >
                    <span className="relative z-10 flex items-center gap-2 px-6 py-3 text-white font-medium">
                        {isRegistered ? 'Registered' : 'Register Now'}
                        {!isRegistered && (
                            <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:w-5" />
                        )}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-2 border-hexbrand">
                <DialogHeader>
                    <DialogTitle>Event Registration</DialogTitle>
                    <DialogDescription>
                        Register for: {eventTitle}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        id="fullname"
                        name="fullname"
                        label="Full Name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                    <InputField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                    <InputField
                        id="phone"
                        name="phone"
                        label="Phone Number"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                        }
                    />
                    <InputField
                        id="address"
                        name="address"
                        label="Company/Organization"
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                company: e.target.value,
                            })
                        }
                    />
                    <Button
                        type="submit"
                        className="mt-8 h-10 w-full group relative overflow-hidden transition-all duration-300 bg-gradient-to-r from-hexbrand to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl active:scale-95"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
