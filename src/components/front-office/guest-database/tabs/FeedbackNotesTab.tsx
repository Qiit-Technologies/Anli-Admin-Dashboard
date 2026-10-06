import { FeedbackNote } from '../types';
import { Star } from 'lucide-react';

export const FeedbackNotesTab = ({ notes }: { notes: FeedbackNote[] }) => {
    // Separate guest feedback and staff notes
    const guestFeedback = notes.filter((note) => !note.isStaffNote);
    const staffNotes = notes.filter((note) => note.isStaffNote);

    return (
        <div className="space-y-6">
            {guestFeedback.length > 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                    <div className="space-y-4">
                        {guestFeedback.map((note) => (
                            <div key={note.id} className="space-y-3">
                                {note.room && (
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Room
                                        </h3>
                                        {note.rating && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-semibold text-emerald-600">
                                                    {note.rating}/5
                                                </span>
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            </div>
                                        )}
                                        {note.ratingDate && (
                                            <span className="text-sm text-slate-500">
                                                {note.ratingDate}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                        Guest Feedback
                                    </h4>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {note.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {staffNotes.length > 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                    <div className="space-y-4">
                        {staffNotes.map((note) => (
                            <div key={note.id}>
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                    Staff Notes
                                </h4>
                                <p className="text-sm text-orange-600 leading-relaxed">
                                    {note.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {notes.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                    No feedback has been captured for this guest yet.
                </div>
            )}
        </div>
    );
};
