'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyFeedbackHistory } from '@/components/feedback/MyFeedbackHistory';
import { SubmitFeedbackForm } from '@/components/feedback/SubmitFeedbackDialog';
import { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface MyFeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MyFeedbackDialog({
    open,
    onOpenChange,
}: MyFeedbackDialogProps) {
    const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 flex flex-col overflow-hidden">
                <VisuallyHidden>
                    <DialogTitle>Feedback</DialogTitle>
                </VisuallyHidden>
                <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                        setActiveTab(value as 'submit' | 'history')
                    }
                    className="w-full flex flex-col h-full"
                >
                    <div className="px-6 pt-6 pb-2">
                        <TabsList className="grid grid-cols-2 w-full rounded-full bg-gray-100">
                            <TabsTrigger value="submit" className="rounded-full">
                                Submit Feedback
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-full">
                                My Feedback
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <TabsContent value="submit" className="mt-0">
                            <SubmitFeedbackForm
                                hideHeader
                                onSubmitted={() => setActiveTab('history')}
                                onCancel={() => onOpenChange(false)}
                            />
                        </TabsContent>
                        <TabsContent value="history" className="mt-0">
                            <MyFeedbackHistory
                                showHeader={false}
                                showSubmitButton={false}
                                contentClassName="space-y-4"
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

