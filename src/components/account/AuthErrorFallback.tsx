import { LockIcon } from 'lucide-react';
import React from 'react';

const AuthErrorFallback = () => {
    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center max-w-md w-full">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LockIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Authentication Required
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Please sign in to access this content. Your session may have
                    expired or you might need to log in again.
                </p>
                <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-400">
                            Need help? Contact support or try refreshing the
                            page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthErrorFallback;
