import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Button } from '@/components/ui/button';

interface TableHeaderProps {
    hasSpaces?: boolean;
    onAddSpace?: () => void;
}

export default function TableHeader({
    hasSpaces = false,
    onAddSpace,
}: TableHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <PageHeader>
                <PageHeadertitle
                    title="Tables / Spaces Setup"
                    subtitle="All details about the table reservations"
                />
            </PageHeader>

            {hasSpaces && (
                <Button
                    onClick={onAddSpace}
                    className="bg-[#0A84FF] text-white rounded-lg py-6 px-9"
                >
                    Add New Space
                </Button>
            )}
        </div>
    );
}
