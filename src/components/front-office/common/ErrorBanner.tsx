import BrandButton from '@/components/common/Button';

interface ErrorBannerProps {
    error: string;
    onRetry: () => void;
}

export const ErrorBanner = ({ error, onRetry }: ErrorBannerProps) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="text-red-400 mr-2">⚠️</div>
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
                <BrandButton
                    onClick={onRetry}
                    className="text-red-600 hover:text-red-800 text-sm underline"
                >
                    Retry
                </BrandButton>
            </div>
        </div>
    );
};
