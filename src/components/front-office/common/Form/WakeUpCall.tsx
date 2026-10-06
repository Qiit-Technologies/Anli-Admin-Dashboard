'use client';
import { createGuestWakeUpCall } from '@/app/actions/guest';
import { InputField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface WakeUpCallProps {
    guestId: number;
}
const WakeUpCall = ({ guestId }: WakeUpCallProps) => {
    const [error, setError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await createGuestWakeUpCall(guestId, formData);
            if (response) {
                if (response.message === 'Wake up call created') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setIsLoading(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div>
            <div>
                <h1 className="text-xl font-semibold">Wake Up Calls</h1>
                <span className="text-sm text-gray-500">
                    Schedule a wake up call for yourself or your team
                </span>
            </div>
            <div className="mt-4">
                <form className="space-y-4">
                    <InputField
                        id="date"
                        label="Scheduled Date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                        }
                    />
                    <InputField
                        id="time"
                        label="Scheduled Time"
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                        }
                    />
                    <InputField
                        id="description"
                        label="Note"
                        type="text"
                        placeholder="e.g. Stand up, Meeting, Hit the gym etc."
                        name="description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button
                        type="submit"
                        className="w-full bg-orion-blue hover:bg-orion-blue h-12"
                        onClick={handleSubmit}
                    >
                        {isLoading ? 'Setting...' : 'Set Wake Up Call'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default WakeUpCall;
