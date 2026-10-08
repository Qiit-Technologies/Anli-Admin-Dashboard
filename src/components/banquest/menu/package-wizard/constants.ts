export const MENU_PACKAGE_WIZARD_STEPS = [
    {
        step: 1,
        title: 'Package Information',
        description: 'Basic details about the package',
    },
    {
        step: 2,
        title: 'Menu Item',
        description: 'Select the menu for the package',
    },
    {
        step: 3,
        title: 'Pricing',
        description: 'Configure quantity',
    },
    {
        step: 4,
        title: 'Review Details',
        description: 'Review and approval each info',
    },
] as const;

export const EVENT_SUITABLE_OPTIONS = [
    'Wedding',
    'Birthday',
    'Corporate',
    'Others',
] as const;

export const SERVICE_STYLE_OPTIONS = [
    'Buffet',
    'Plated',
    'Cocktail Style',
] as const;

export const SPECIAL_ADD_ONS = [
    { id: 'photographer', label: 'Professional Photographer', price: 250000 },
    { id: 'live-band', label: 'Live Band', price: 250000 },
    { id: 'videographer', label: 'Videographer', price: 250000 },
    { id: 'kid-menu', label: 'Kid Menu', price: 250000 },
] as const;

export const ADDITIONAL_ITEMS = [
    'Water',
    'Soft Drink',
    'Fruit Juice',
    'Others',
] as const;

export const MEAL_TYPE_OPTIONS = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'buffet', label: 'Buffet' },
];

export const PORTION_OPTIONS = [
    { value: 'standard', label: 'Standard' },
    { value: 'large', label: 'Large' },
    { value: 'small', label: 'Small' },
];
