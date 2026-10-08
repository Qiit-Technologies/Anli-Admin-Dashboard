'use client';

import { forwardRef } from 'react';

interface DocumentPreviewFrameProps {
    html: string;
    title: string;
    className?: string;
}

/** Renders print HTML in an iframe via srcDoc (reliable in Radix dialogs). */
export const DocumentPreviewFrame = forwardRef<
    HTMLIFrameElement,
    DocumentPreviewFrameProps
>(function DocumentPreviewFrame({ html, title, className }, ref) {
    if (!html) {
        return (
            <div className="flex min-h-[480px] items-center justify-center bg-white border text-sm text-muted-foreground">
                Loading preview…
            </div>
        );
    }

    return (
        <iframe
            ref={ref}
            title={title}
            srcDoc={html}
            className={className ?? 'w-full min-h-[720px] bg-white border'}
            sandbox="allow-same-origin allow-modals"
        />
    );
});
