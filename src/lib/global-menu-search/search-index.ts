import type { MenuSearchResult, SearchableMenuItem } from './types';

const DEFAULT_LIMIT = 50;

function scoreMatch(item: SearchableMenuItem, tokens: string[]): number {
    const name = item.name.toLowerCase();
    let score = 0;

    for (const token of tokens) {
        if (name === token) score += 100;
        else if (name.startsWith(token)) score += 50;
        else if (name.includes(token)) score += 20;
        else if (item.searchText.includes(token)) score += 5;
        else return -1;
    }

    if (!item.isAvailable) score -= 2;
    return score;
}

export class MenuSearchIndex {
    private readonly items: SearchableMenuItem[];

    constructor(items: SearchableMenuItem[]) {
        this.items = items;
    }

    search(query: string, limit = DEFAULT_LIMIT): MenuSearchResult[] {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return [];

        const tokens = trimmed.split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return [];

        const matches: MenuSearchResult[] = [];

        for (const item of this.items) {
            const score = scoreMatch(item, tokens);
            if (score < 0) continue;

            matches.push({ ...item, score });
            if (matches.length >= limit * 4) break;
        }

        return matches
            .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
            .slice(0, limit);
    }

    get size() {
        return this.items.length;
    }
}
