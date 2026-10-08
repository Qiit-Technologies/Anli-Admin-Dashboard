'use client';
interface BlogCategoryHeaderProps {
    matchingType: string;
}

export default function BlogCategoryHeader({
    matchingType,
}: BlogCategoryHeaderProps) {
    return (
        <section className="relative h-[50vh] flex flex-col items-center justify-center gap-5 py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />

            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '20px 20px',
                }}
            />

            <div className="relative z-10 text-white text-center mt-8">
                <div className="mb-4">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-6" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
                    {matchingType}
                </h1>

                <div className="mt-6">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-blue-800 mx-auto" />
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20" />
        </section>
    );
}
