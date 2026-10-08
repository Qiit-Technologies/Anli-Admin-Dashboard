'use client';
import NewsLetter from '@/components/landing-revised/NewsLetter';
import Benefits from '@/components/landing-revised/Product/Benefits';
import CenterContainer from '@/components/landing-revised/Product/CenterContainer';
import FlexContainer from '@/components/landing-revised/Product/FlexContainer';
import SmoothScroll from '@/components/landing-revised/SmoothScroll';
import Testimonials from '@/components/landing-revised/Testimonial';

const propertyManagementSystem = {
    title: 'Property Management System (PMS)',
    description:
        'Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.',
    list: [
        {
            title: 'Cloud-Based Accessibility',
            description: 'Manage your hotel operations from anywhere, anytime.',
        },
        {
            title: 'Reservation & Booking Management',
            description:
                'Automate bookings, reduce overbookings, and ensure seamless guest check-ins and check-outs',
        },
        {
            title: 'Housekeeping & Maintenance Tracking',
            description:
                'Assign tasks, track cleaning schedules, and ensure optimal room availability.',
        },
        {
            title: 'Guest Profiles & CRM',
            description:
                'Store guest preferences, provide personalized experiences, and improve customer retention.',
        },
        {
            title: 'Multi-Property Management',
            description:
                'Easily manage multiple hotel locations from a single dashboard.',
        },
    ],
};

const channelManager = {
    title: 'Channel Manager',
    description: 'Manage your hotel operations from anywhere, anytime.',
    list: [
        {
            title: 'Cloud-Based Accessibility',
            description: 'Manage your hotel operations from anywhere, anytime.',
        },
        {
            title: 'Reservation & Booking Management',
            description:
                'Automate bookings, reduce overbookings, and ensure seamless guest check-ins and check-outs',
        },
        {
            title: 'Housekeeping & Maintenance Tracking',
            description:
                'Assign tasks, track cleaning schedules, and ensure optimal room availability.',
        },
    ],
};

const revenueRateManagement = {
    title: 'Revenue & Rate Management',
    description:
        'Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.',
    list: [
        {
            title: 'Automated Rate Management',
            description:
                'Automate rate changes, track occupancy, and optimize revenue with our AI-powered rate management tool.',
        },
        {
            title: 'Revenue Forecasting',
            description:
                'Predict revenue trends and make informed decisions with our advanced revenue forecasting tool.',
        },
        {
            title: 'Revenue Analysis',
            description:
                'Analyze revenue data to identify trends, optimize pricing strategies, and improve guest experiences.',
        },
    ],
};

const paymentInvoicing = {
    title: 'Payment & Invoicing',
    description:
        'Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.',
    list: [
        {
            title: 'Automated Rate Management',
            description:
                'Automate rate changes, track occupancy, and optimize revenue with our AI-powered rate management tool.',
        },
        {
            title: 'Revenue Forecasting',
            description:
                'Predict revenue trends and make informed decisions with our advanced revenue forecasting tool.',
        },
        {
            title: 'Revenue Analysis',
            description:
                'Analyze revenue data to identify trends, optimize pricing strategies, and improve guest experiences.',
        },
    ],
};

const page = () => {
    return (
        <>
            <CenterContainer
                id="Product-Hero"
                aria-label="Product-Hero"
                backgroundImage="/landing/product/hero-landing.jpg"
                enableParallax={true}
                parallaxSpeed={0.5}
            >
                <div className="max-w-sm lg:max-w-2xl flex flex-col gap-6 text-white text-center">
                    <h1 className="text-xl font-bold lg:text-4xl">
                        ANLI Solutions is a cutting-edge hospitality management
                        system
                    </h1>
                    <p>
                        Our all-in-one platform integrates advanced technology
                        to help hoteliers manage reservations, optimize
                        resources, and increase revenue effortlessly.
                    </p>
                </div>
            </CenterContainer>
            <FlexContainer
                variant="right"
                className="bg-gray-50"
                backgroundImage="/landing/product/pms.jpg"
                details={propertyManagementSystem}
            />
            <SmoothScroll>
                <FlexContainer
                    variant="left"
                    backgroundImage="/landing/product/cm.jpg"
                    details={channelManager}
                />
            </SmoothScroll>
            <SmoothScroll>
                <CenterContainer backgroundImage="/landing/product/hallway.jpg">
                    <div className="max-w-md lg:max-w-2xl  flex flex-col gap-6 text-white text-center">
                        <h1 className="text-2xl font-bold lg:text-4xl">
                            Designed to simplify operations, maximize
                            efficiency, and enhance guest experiences
                        </h1>
                    </div>
                </CenterContainer>
            </SmoothScroll>
            <SmoothScroll>
                <FlexContainer
                    variant="right"
                    backgroundImage="/landing/product/rrm.jpg"
                    className="bg-gray-50"
                    details={revenueRateManagement}
                />
            </SmoothScroll>
            <SmoothScroll>
                <FlexContainer
                    variant="left"
                    backgroundImage="/landing/product/pi.jpg"
                    details={paymentInvoicing}
                />
            </SmoothScroll>
            <SmoothScroll>
                <CenterContainer backgroundImage="/landing/product/bedroom.jpg">
                    <div className="max-w-md lg:max-w-2xl  flex flex-col gap-6 text-white text-center">
                        <h1 className="text-2xl font-bold lg:text-4xl">
                            Designed to simplify operations, maximize
                            efficiency, and enhance guest experiences
                        </h1>
                    </div>
                </CenterContainer>
            </SmoothScroll>
            <SmoothScroll>
                <FlexContainer
                    variant="right"
                    backgroundImage="/landing/product/som.jpg"
                    className="bg-gray-50"
                    details={{
                        title: 'Staff & Operations Management',
                        description:
                            'Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.',
                        list: [
                            {
                                title: 'Task Automation & Scheduling',
                                description:
                                    'Assign and track staff responsibilities efficiently.',
                            },
                            {
                                title: 'Payroll & HR Managements',
                                description:
                                    'Manage employee records, payroll processing, and shift scheduling.',
                            },
                            {
                                title: 'Mobile Staff App',
                                description:
                                    ' Enable on-the-go access for hotel staff to manage tasks and guest requests.',
                            },
                        ],
                    }}
                />
            </SmoothScroll>
            <SmoothScroll>
                <FlexContainer
                    variant="left"
                    backgroundImage="/landing/product/rbi.jpg"
                    details={{
                        title: 'Reporting & Business Intelligence',
                        description:
                            'Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.',
                        list: [
                            {
                                title: 'Customizable Dashboards',
                                description:
                                    'Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.',
                            },
                            {
                                title: 'Financial & Occupancy Reports',
                                description:
                                    'Generate detailed insights to optimize business performance.',
                            },
                            {
                                title: 'Guest Satisfaction Analytics',
                                description:
                                    ' Monitor guest feedback and improve service quality.',
                            },
                        ],
                    }}
                />
            </SmoothScroll>
            <SmoothScroll>
                <Benefits />
            </SmoothScroll>
            <Testimonials />
            <NewsLetter />
        </>
    );
};

export default page;
