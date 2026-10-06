export interface AppSettings {
    restaurantId: string;
    restaurantName: string;
    restaurantLogo: string;
    themeId: string;
    fontId: string;
    brandColor: string;
    logoImage: string;
    coverImage: string;
}

export const defaultSettings: AppSettings = {
    restaurantId: '1',
    restaurantName: '',
    restaurantLogo: '',
    themeId: 'orange',
    fontId: 'dm-sans',
    brandColor: '#FF6F00',
    logoImage: '',
    coverImage: '',
};

export const SETTINGS_STORAGE_KEY = 'qr-menu-settings';
export const FAVOURITES_STORAGE_KEY = 'qr-menu-favourites';
