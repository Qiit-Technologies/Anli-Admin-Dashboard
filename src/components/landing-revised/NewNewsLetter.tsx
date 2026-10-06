'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Heading from './layout/Heading';
import Paragraph from './layout/Paragraph';
import Section from './layout/Section';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import Toast from '@/components/toast';
import { toast } from 'react-hot-toast';

const NewNewsLetter = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Please enter your email address"
                    type="error"
                />
            ));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Please enter a valid email address"
                    type="error"
                />
            ));
            return;
        }

        setIsLoading(true);

        try {
            const result = await subscribeToNewsletter({
                email: email.trim(),
                source: 'landing-page',
            });

            if (result.message === 'Successfully subscribed to newsletter') {
                setIsSubscribed(true);
                setEmail('');
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={
                            result.message ||
                            'Successfully subscribed to newsletter!'
                        }
                        type="success"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            result.message ||
                            'Failed to subscribe. Please try again.'
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

    return (
        <Section className="w-full relative px-5 lg:px-24 py-0 lg:py-10">
            <div className="w-full h-full flex items-center justify-center">
                <div className="lg:max-w-5xl overflow-hidden rounded-2xl lg:rounded-xl z-10 w-full bg-[#001933] h-[500px] lg:h-[350px] relative">
                    <Image
                        src="/landing/newsletterbg.png"
                        alt=""
                        className="w-full h-full z-20 object-cover"
                        quality={100}
                        fill
                        sizes="100vw"
                        style={{
                            objectFit: 'cover',
                        }}
                    />
                    <div className="flex w-full h-full items-center justify-center inset-0 absolute z-30 flex-col lg:flex-row">
                        <div className="flex flex-col gap-6 items-center text-center max-w-lg p-4 lg:p-6">
                            <Heading className="text-white">
                                Stay Connected with Us
                            </Heading>
                            <Paragraph>
                                Take Your Hotel to the Next Level Maximise
                                efficiency, enhance guest experiences, and grow
                                your revenue with ANLI Solutions.
                            </Paragraph>
                            {!isSubscribed ? (
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col lg:flex-row items-center gap-3 justify-center w-full h-full"
                                >
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={isLoading}
                                        className="px-4 py-2 h-12 bg-white rounded-l-md border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !email.trim()}
                                        className="px-8 py-2 w-full lg:w-fit h-12 rounded-r-md bg-hexbrand text-white hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading
                                            ? 'Subscribing...'
                                            : 'Subscribe'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="flex flex-col items-center gap-3 justify-center w-full h-full">
                                    <div className="text-white text-lg font-semibold">
                                        Thank you for subscribing!
                                    </div>
                                    <Button
                                        onClick={() => setIsSubscribed(false)}
                                        className="px-8 py-2 w-full lg:w-fit h-12 rounded-r-md bg-hexbrand text-white hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
                                    >
                                        Subscribe Another Email
                                    </Button>
                                </div>
                            )}
                            <span className="text-muted-foreground text-center lg:text-start text-xs">
                                Your privacy matters. We&apos;ll never share
                                your information without your consent.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default NewNewsLetter;
