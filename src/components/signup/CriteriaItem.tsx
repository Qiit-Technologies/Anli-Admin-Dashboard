import { FiX, FiCheck } from 'react-icons/fi';

export default function CriteriaItem({
    isValid,
    label,
    showXInsteadOfCheckmark = false,
}: {
    isValid: boolean;
    label: string;
    showXInsteadOfCheckmark?: boolean;
}) {
    return (
        <div
            className={
                `flex items-center gap-2 p-2 rounded-lg mt-2 ` +
                (isValid
                    ? 'text-green-600 bg-[#E0F3E0]'
                    : showXInsteadOfCheckmark
                      ? 'text-red-500 bg-red-300'
                      : 'text-gray-500 bg-[#FAFAFA]')
            }
        >
            <span
                role="img"
                aria-label={isValid ? 'Criteria met' : 'Criteria not met'}
            >
                {showXInsteadOfCheckmark && !isValid ? (
                    <FiX className="rounded-sm" aria-hidden="true" />
                ) : (
                    <FiCheck className="rounded-sm" aria-hidden="true" />
                )}
            </span>
            <span className="text-xs">{label}</span>
        </div>
    );
}
