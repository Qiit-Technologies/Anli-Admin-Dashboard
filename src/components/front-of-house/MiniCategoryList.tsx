'use client';

type MiniCategory = {
    value: string;
    label: string;
};

const MiniCategoryList = ({
    miniCategories,
    selectedSubCategory,
    onSelect,
}: {
    miniCategories: MiniCategory[];
    selectedSubCategory: string;
    onSelect: (value: string) => void;
}) => {
    const CategoryButton = ({
        category,
        onClick,
    }: {
        category: MiniCategory;
        onClick: () => void;
    }) => (
        <button
            onClick={onClick}
            className={`
                px-4 py-2 rounded-full shadow-none text-sm font-medium
                transition-all duration-200 ease-in-out
                flex items-center gap-2
                ${
                    selectedSubCategory === category.value
                        ? 'bg-hexbrand text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }
            `}
        >
            {category.label}
        </button>
    );

    return (
        <div className="flex flex-wrap gap-2">
            {miniCategories.map((category) => (
                <CategoryButton
                    key={category.value}
                    category={category}
                    onClick={() => onSelect(category.value)}
                />
            ))}
        </div>
    );
};

export default MiniCategoryList;
