export const WIZARD_STEPS = [
    {
        step: 1,
        title: 'Event Information',
        description: 'Create event',
    },
    {
        step: 2,
        title: 'Customer Information',
        description: 'Enter customer info',
    },
    {
        step: 3,
        title: 'Menu Details',
        description: 'Select food menu',
    },
    {
        step: 4,
        title: 'Amenities Details',
        description: 'Choose the amenities for the event',
    },
    {
        step: 5,
        title: 'Review Details',
        description: 'Review and approve each info',
    },
    {
        step: 6,
        title: 'Payment Info',
        description: 'Select payment method',
    },
] as const;

export const EVENT_CATEGORIES = [
    'Wedding',
    'Birthday',
    'Corporate',
    'Party',
    'Conference',
    'Seminar',
    'Others',
] as const;

export const DEFAULT_EVENT_TYPES = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'social', label: 'Social' },
    { value: 'conference', label: 'Conference' },
] as const;

export const EVENT_TYPE_OTHER_VALUE = 'other';

export const AMENITY_CATEGORY_PILLS = [
    { id: 'all', label: 'All Category' },
    { id: 'decoration', label: 'Decoration' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'service', label: 'Service' },
    { id: 'others', label: 'Others' },
    { id: 'audio', label: 'Audio & virtual' },
] as const;

export const CUSTOMER_TYPES = [
    { value: 'individual', label: 'Individual' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'agent', label: 'Agent' },
] as const;

export const TITLE_OPTIONS = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
] as const;
