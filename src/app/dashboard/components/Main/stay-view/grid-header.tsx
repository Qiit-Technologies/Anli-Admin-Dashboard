interface GridHeaderProps {
    currentDate: Date;
    daysToShow: number;
}

export function GridHeader({ currentDate, daysToShow }: GridHeaderProps) {
    return (
        <thead>
            <tr>
                <th className="border-b border-r px-2 sticky left-0 bg-white z-10 w-[200px]">
                    Room Type
                </th>
                {Array.from({ length: daysToShow }, (_, i) => {
                    const date = new Date(currentDate);
                    date.setDate(date.getDate() + i);
                    return (
                        <th
                            key={i}
                            className="border-b border-r p-1 text-center w-[100px] min-w-[100px]"
                        >
                            <div className="text-xs font-medium">
                                {date.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                })}
                            </div>
                            <div className="text-xs font-medium">
                                {date.getDate()}
                            </div>
                            <div className="text-xs font-medium">
                                {date.toLocaleDateString('en-US', {
                                    month: 'short',
                                })}
                            </div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}
