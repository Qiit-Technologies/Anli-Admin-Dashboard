'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CreditCard, Globe, Puzzle } from 'lucide-react';
import { useState } from 'react';
import Heading from './layout/Heading';
import Paragraph from './layout/Paragraph';
import Section from './layout/Section';

export default function WhatsNewSection() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    const features = [
        {
            title: 'Better Pricing',
            description:
                "We've revamped our pricing structure to provide more value at every tier.",
            icon: CreditCard,
        },
        {
            title: 'Pay in Local Currency',
            description:
                'Now supporting payments in over 135 currencies worldwide.',
            icon: Globe,
        },
        {
            title: 'More Integrations',
            description:
                'Connect with your favorite tools and services more easily than ever.',
            icon: Puzzle,
        },
    ];

    return (
        <Section className="py-24 px-6 md:px-6 bg-gray-50 dark:from-gray-950 dark:to-black">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <Heading className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-black">
                        What&apos;s New
                    </Heading>
                    <Paragraph className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        We&apos;re constantly improving our platform to serve
                        you better. Check out our latest updates.
                    </Paragraph>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 mt-20 gap-10 md:gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                        >
                            <Card
                                className={`h-full rounded-lg -hover:translate-y-5 transition-all relative border bg-transparent shadow-none duration-300
                                   `}
                            >
                                {/**background card */}
                                <div
                                    className={`
                                    absolute rounded-lg -rotate-3 z-10 bg-hexbrand/30 w-full h-full 
                                    transition-all
                                    ${
                                        hoveredCard === index
                                            ? 'opacity-100 translate-y-0 left-0 top-0'
                                            : 'opacity-100 translate-y-0 left-4 top-4'
                                    }
                                  `}
                                />
                                <CardContent
                                    onMouseEnter={() => setHoveredCard(index)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    className="pt-6 z-30 rouded-lg bg-white hover:bg-hexbrand hover:border-white border shadow-none w-full h-full overflow-hidden relative border-none transition-all rounded-lg group"
                                >
                                    <div className="flex flex-col rounded-lg overflow-hidden items-center text-center z-40">
                                        <div
                                            className={`hover:bg-hexbrand/30 hover:text-white bg-gray-100 text-gray-600 p-3 rounded-full mb-4 relative`}
                                        >
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl group-hover:text-white font-semibold mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 group-hover:text-white dark:text-gray-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
