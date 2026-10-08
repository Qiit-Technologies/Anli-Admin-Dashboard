'use client';

import { CreateDemoRequest } from '@/app/actions/demo-request';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    company: z.string().min(1, { message: 'Company name is required.' }),
    phone: z.string().optional(),
    companySize: z.string(),
    preferredDate: z.date({
        required_error: 'Please select a preferred date for the demo.',
    }),
    message: z.string().optional(),
});

type DemoRequestFormProps = {
    readonly variant?: 'demo' | 'free-trial' | 'conference';
};

export default function DemoRequestForm({
    variant = 'demo',
}: DemoRequestFormProps) {
    const [isSuccess, setIsSuccess] = useState(false);
    const isFreeTrial = variant === 'free-trial';
    const isConference = variant === 'conference';

    function getSubmitLabel() {
        if (isFreeTrial) return 'Start Free Trial';
        if (isConference) return 'Claim Offer';
        return 'Request Your Demo';
    }

    function getResetLabel() {
        if (isFreeTrial) return 'Start Another Free Trial';
        if (isConference) return 'Claim Another Offer';
        return 'Request Another Demo';
    }

    const submitLabel = getSubmitLabel();
    const resetLabel = getResetLabel();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            company: '',
            phone: '',
            companySize: '10-49',
            message: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            let message = values.message;
            if (isFreeTrial) {
                message = values.message
                    ? `[Free Trial Request] ${values.message}`
                    : '[Free Trial Request]';
            } else if (isConference) {
                message = values.message
                    ? `[Conference 120-Day Offer] ${values.message}`
                    : '[Conference 120-Day Offer]';
            }
            const payload = { ...values, message };
            const response = await CreateDemoRequest(payload);

            if (response.data) {
                setIsSuccess(true);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={
                            isFreeTrial
                                ? 'Free Trial request submitted successfully!'
                                : 'Demo Request successfully!'
                        }
                        type="success"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={`Failed to create ${isFreeTrial ? 'free trial' : 'demo'} request: ${response.error}`}
                        type="error"
                    />
                ));
            }
        } catch (e) {
            console.error('Error submitting request:', e);
            toast.error('An error occurred while submitting your request.');
            return;
        }
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-hexbrand/10 p-3">
                    <CheckCircle2 className="h-8 w-8 text-hexbrand" />
                </div>
                <h3 className="mb-2 text-2xl font-bold">Thank You!</h3>
                <p className="mb-6 text-slate-600">
                    {isFreeTrial
                        ? 'Your free trial request has been prepared. Please send the email that opened in your email client to submit your request.'
                        : 'Your demo request has been prepared. Please send the email that opened in your email client to submit your request.'}
                </p>
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsSuccess(false);
                        form.reset();
                    }}
                >
                    {resetLabel}
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="john@example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hotel Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acme Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="+1 (555) 000-0000"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="companySize"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hotel Size</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select company size" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1-9">
                                            1-9 employees
                                        </SelectItem>
                                        <SelectItem value="10-49">
                                            10-49 employees
                                        </SelectItem>
                                        <SelectItem value="50-249">
                                            50-249 employees
                                        </SelectItem>
                                        <SelectItem value="250-999">
                                            250-999 employees
                                        </SelectItem>
                                        <SelectItem value="1000+">
                                            1000+ employees
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Preferred Demo Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'pl-3 text-left font-normal',
                                                    !field.value &&
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(
                                                date: Date | undefined,
                                            ) => date && field.onChange(date)}
                                            disabled={(date: Date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Additional Information (Optional)
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us about your specific needs or questions..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Share any specific requirements or questions you
                                have.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full bg-hexbrand hover:bg-hexbrand/90"
                >
                    {submitLabel}
                </Button>
            </form>
        </Form>
    );
}
