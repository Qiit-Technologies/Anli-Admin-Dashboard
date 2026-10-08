import { extractDateTime } from '@/lib/utils';

const DateRenderer = ({
    row,
}: {
    row: { original: { createdAt: string } };
}) => {
    const requestTime = row.original.createdAt;
    const time = extractDateTime(requestTime).time;
    const ampm = extractDateTime(requestTime).ampm;
    return <span>{`${time} ${ampm}`}</span>;
};

export default DateRenderer;
