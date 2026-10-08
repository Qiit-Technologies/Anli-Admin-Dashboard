import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedStar } from './AnimatedStar';
import Heading from './layout/Heading';
import Section from './layout/Section';

const infoField = [
    {
        title: 'Future-Proof Technology',
        subTitle: 'Built with next-gen cloud architecture for scalability',
    },
    {
        title: 'User-Friendly Interface.',
        subTitle: 'Intuitive design that simplifies hotel operations.',
        link: '/learn-more/interface',
    },
    {
        title: 'All-in-One Platform.',
        subTitle:
            'Integrates reservations, payments, rate management, and automation',
        link: '/learn-more/platform',
    },
    {
        title: 'AI-Powered Optimisation.',
        subTitle:
            'Leverage intelligent automation for faster, smarter decisions.',
    },
];
const WhyChooseUs = () => {
    return (
        <Section className="w-full relative lg:py-24">
            <AnimatedStar
                className="fill-black text-black hidden lg:block"
                position={{ bottom: '20rem' }}
            />

            <AnimatedStar
                className="fill-black text-black hidden lg:block"
                position={{ top: '10rem', right: '10rem' }}
            />
            <div className="w-full h-full flex flex-col gap-10">
                <div className="text-center lg:text-start">
                    <Heading>Why Choose Anli Solutions</Heading>
                    <span className="text-muted-foreground">
                        We solve the biggest challenges in hotel management with
                        cutting-edge technology:
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-10 lg:gap-0 lg:grid-cols-2 w-full">
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="rounded-xl lg:rounded-[42px] border-4 w-fit border-[#002955] overflow-hidden">
                            <Image
                                src="/landing/why-choose-us.png"
                                alt="why choose us"
                                width={500}
                                height={500}
                                priority
                            />
                        </div>
                    </div>
                    <div className="w-full h-full flex items-center justify-center flex-col gap-8">
                        {infoField.map((item, index) => {
                            return (
                                <motion.div
                                    className="w-full"
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-10px' }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.25,
                                        ease: 'easeOut',
                                    }}
                                >
                                    <motion.h2
                                        className="text-2xl"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.25 + 0.1,
                                        }}
                                    >
                                        {item.title
                                            .split('')
                                            .map((char, charIndex) => (
                                                <motion.span
                                                    key={charIndex}
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{
                                                        duration: 0.2,
                                                        delay:
                                                            index * 0.25 +
                                                            0.2 +
                                                            charIndex * 0.03,
                                                    }}
                                                >
                                                    {char}
                                                </motion.span>
                                            ))}
                                    </motion.h2>

                                    <motion.p
                                        className="text-base text-muted-foreground"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.25 + 0.3,
                                        }}
                                    >
                                        {item.subTitle}
                                    </motion.p>

                                    {item.link && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.25 + 0.4,
                                            }}
                                        >
                                            <Link
                                                href={item.link}
                                                className="group text-base flex items-center gap-1 mt-4 text-orion-blue font-medium"
                                            >
                                                Learn More{' '}
                                                <ArrowRight className="w-4 h-4 group-hover:ml-2 transition-all" />
                                            </Link>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default WhyChooseUs;
