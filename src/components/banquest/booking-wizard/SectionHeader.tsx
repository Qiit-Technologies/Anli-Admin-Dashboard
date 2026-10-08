'use client';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}
const SectionHeader = ({ title, subtitle }: Readonly<SectionHeaderProps>) => {
    return (
        <div className="flex flex-col w-full">
            <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                {title}
            </h2>
            {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
            <div className="h-px w-full bg-gray-200 mt-4" />
        </div>
    );
};

export default SectionHeader;
