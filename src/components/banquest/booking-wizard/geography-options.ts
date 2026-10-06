import { allCountries } from 'country-region-data';

export function getCountryOptions() {
    return allCountries.map((country) => ({
        value: country[0],
        label: country[0],
    }));
}

export function getNigeriaStateOptions() {
    const nigeria = allCountries.find((country) => country[0] === 'Nigeria');
    if (!nigeria?.[2]) return [];

    return nigeria[2].map(([name, slug]) => ({
        value: slug,
        label: name,
    }));
}
