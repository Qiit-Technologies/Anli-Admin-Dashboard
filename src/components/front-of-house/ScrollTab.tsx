import { TabsList, TabsTrigger } from '../ui/tabs';

export function ScrollableTabs({
    categoryOptions,
}: {
    categoryOptions: any[];
}) {
    return (
        <div className="relative w-full">
            <TabsList className="w-full justify-start gap-2 bg-transparent flex-wrap h-auto min-h-10">
                {categoryOptions.map((tab: any) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="text-base border px-3 py-1.5 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-lg data-[state=active]:border-hexbrand whitespace-normal text-left h-auto"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>
    );
}
