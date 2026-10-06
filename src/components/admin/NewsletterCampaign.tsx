'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    sendNewsletterCampaign,
    getMailerLiteSubscribers,
} from '@/app/actions/mailerlite';
import Toast from '@/components/toast';
import { toast } from 'react-hot-toast';

interface NewsletterCampaignProps {
    className?: string;
}

export default function NewsletterCampaign({
    className,
}: NewsletterCampaignProps) {
    const [subject, setSubject] = useState('');
    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

    const handleSendCampaign = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subject.trim() || !html.trim()) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Please fill in both subject and content"
                    type="error"
                />
            ));
            return;
        }

        setIsLoading(true);

        try {
            const result = await sendNewsletterCampaign({
                subject: subject.trim(),
                html: html.trim(),
            });

            if (result.success) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={
                            result.message ||
                            'Newsletter campaign sent successfully!'
                        }
                        type="success"
                    />
                ));
                setSubject('');
                setHtml('');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            result.error ||
                            'Failed to send campaign. Please try again.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="An unexpected error occurred. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetSubscriberCount = async () => {
        try {
            const result = await getMailerLiteSubscribers();
            if (result.success && result.data) {
                setSubscriberCount(result.data.length || 0);
            }
        } catch (error: any) {
            console.error('Failed to get subscriber count:', error);
        }
    };

    return (
        <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Newsletter Campaign
                </h2>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleGetSubscriberCount}
                        variant="outline"
                        size="sm"
                    >
                        Get Subscriber Count
                    </Button>
                    {subscriberCount !== null && (
                        <span className="text-sm text-gray-600">
                            {subscriberCount} subscribers
                        </span>
                    )}
                </div>
            </div>

            <form onSubmit={handleSendCampaign} className="space-y-4">
                <div>
                    <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Subject Line
                    </label>
                    <Input
                        id="subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter campaign subject..."
                        className="w-full"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="html"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email Content (HTML)
                    </label>
                    <Textarea
                        id="html"
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        placeholder="Enter your email content in HTML format..."
                        className="w-full min-h-[300px] font-mono text-sm"
                        required
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        type="submit"
                        disabled={isLoading || !subject.trim() || !html.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Sending...' : 'Send Campaign'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setSubject('');
                            setHtml('');
                        }}
                        disabled={isLoading}
                    >
                        Clear
                    </Button>
                </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                    Tips for Better Campaigns:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use engaging subject lines to improve open rates</li>
                    <li>• Include a clear call-to-action in your emails</li>
                    <li>• Test your HTML content before sending</li>
                    <li>• Keep your content relevant to your hotel audience</li>
                    <li>• Include unsubscribe links for compliance</li>
                </ul>
            </div>
        </div>
    );
}
