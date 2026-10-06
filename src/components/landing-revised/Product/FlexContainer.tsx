'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Section from '../layout/Section';

interface FlexContainerProps {
    variant: 'left' | 'right';
    backgroundImage: string;
    className?: string;
    details: TextComponentProps;
}

interface TextComponentProps {
    title: string;
    description: string;
    list: {
        title: string;
        description: string;
    }[];
}

const TextComponent = ({ title, description, list }: TextComponentProps) => {
    return (
        <div className="flex flex-col gap-4 max-w-lg">
            <h1 className="text-3xl">{title}</h1>
            <p className="text-muted-foreground">{description}</p>

            <div className="ml-0 lg:ml-4 flex flex-col gap-4">
                {list.map((item, index) => {
                    return (
                        <div key={index}>
                            <span className="text-base leading-6 text-muted-foreground">
                                <span className="font-bold">{item.title}</span>:{' '}
                                <span>{item.description}</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
const FlexContainer = ({
    variant,
    backgroundImage,
    details,
    className,
}: FlexContainerProps) => {
    return (
        <Section
            className={cn(
                'w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 relative lg:h-screen',
                className,
            )}
        >
            {variant === 'right' && (
                <div className="w-full h-full flex items-center justify-center">
                    <TextComponent
                        title={details.title}
                        description={details.description}
                        list={details.list}
                    />
                </div>
            )}
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-full lg:w-[450px] relative h-[300px] lg:h-[500px] flex items-center justify-center">
                    <Image
                        src={backgroundImage}
                        fill
                        className="w-full h-full object-cover rounded-3xl"
                        style={{ objectFit: 'cover' }}
                        alt={`${backgroundImage}`}
                    />
                </div>
            </div>
            {variant === 'left' && (
                <div className="w-full h-full flex items-center justify-center">
                    <TextComponent
                        title={details.title}
                        description={details.description}
                        list={details.list}
                    />
                </div>
            )}
        </Section>
    );
};

export default FlexContainer;
