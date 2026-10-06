'use client';
import { LucideExternalLink, LucideHelpCircle, Search } from 'lucide-react';

import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { LuBell, LuExternalLink, LuMail } from 'react-icons/lu';
export default function SupportComponent() {
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Support Center"
                    subtitle={
                        'Get help with your account, billing, and technical issues.'
                    }
                />
                <div className="ml-auto flex items-center">
                    <Button className="ml-4 bg-white rounded-full border text-gray-400">
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search for help..."
                    className="pl-10 w-full max-w-lg"
                />
            </div>
            <div className="grid gap-6 md:grid-cols-1">
                <Card className="overflow-hidden shadow-none">
                    <CardContent className="p-0">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <LuMail className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium text-lg">
                                    General Inquiries
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                For general questions about our services and
                                company
                            </p>
                            <Link
                                href="mailto:info@weareanli.com"
                                className="flex items-center gap-2 text-primary hover:underline font-medium"
                            >
                                info@weareanli.com
                                <LucideExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden shadow-none">
                    <CardContent className="p-0">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <LucideHelpCircle className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium text-lg">
                                    Technical Support
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                For help with technical issues or
                                account-related problems
                            </p>
                            <Link
                                href="mailto:support@weareanli.com"
                                className="flex items-center gap-2 text-primary hover:underline font-medium"
                            >
                                support@weareanli.com
                                <LuExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
}
{
    /* <Tabs defaultValue="faq" className="w-full bg-white p-4 rounded-md">
                <TabsList className="mb-4">
                    <TabsTrigger value="faq">FAQs</TabsTrigger>
                    <TabsTrigger value="contact">Contact Us</TabsTrigger>
                    <TabsTrigger value="docs">Documentation</TabsTrigger>
                </TabsList>

                <TabsContent value="faq" className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                How do I reset my password?
                            </AccordionTrigger>
                            <AccordionContent>
                                You can reset your password by clicking on the
                                &quot;Forgot Password&quot; link on the login
                                page. You&apos;ll receive an email with
                                instructions to create a new password.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                How do I update my billing information?
                            </AccordionTrigger>
                            <AccordionContent>
                                Go to Settings → Billing and you can update your
                                payment method, view invoices, and manage your
                                subscription plan.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                Can I change my subscription plan?
                            </AccordionTrigger>
                            <AccordionContent>
                                Yes, you can upgrade or downgrade your
                                subscription at any time. Changes will be
                                prorated for the remainder of your billing
                                cycle.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                How do I add team members?
                            </AccordionTrigger>
                            <AccordionContent>
                                Navigate to Settings → Team and click
                                &quot;Invite Member&quot;. Enter their email
                                address and select their role. They&apos;ll
                                receive an invitation via email.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>
                                Is there a mobile app available?
                            </AccordionTrigger>
                            <AccordionContent>
                                Yes, we offer mobile apps for iOS and Android.
                                You can download them from the App Store or
                                Google Play Store.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Support</CardTitle>
                                <CardDescription>
                                    Get help via email
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    Our support team typically responds within
                                    24 hours on business days.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">
                                    <Link href="mailto:support@example.com">
                                        Contact Support
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Live Chat</CardTitle>
                                <CardDescription>
                                    Chat with our support team
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    Available Monday to Friday, 9am to 5pm EST.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">
                                    Start Chat
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule a Call</CardTitle>
                                <CardDescription>
                                    Book a call with an expert
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    For complex issues, schedule a call with our
                                    technical team.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">
                                    Book Appointment
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="docs" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Getting Started</CardTitle>
                                <CardDescription>
                                    Learn the basics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    New to our platform? Start here to learn the
                                    fundamentals.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">
                                    View Guide
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>API Documentation</CardTitle>
                                <CardDescription>
                                    Technical references
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    Comprehensive API documentation for
                                    developers.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">
                                    View Docs
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Video Tutorials</CardTitle>
                                <CardDescription>
                                    Visual learning
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    Watch step-by-step tutorials on how to use
                                    our platform.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">
                                    Watch Videos
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs> */
}
