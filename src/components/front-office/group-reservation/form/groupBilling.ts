/** Split a naira total across weighted rows without losing kobo to rounding. */
export function allocateShares(total: number, weights: number[]): number[] {
    const n = weights.length;
    if (n === 0) return [];
    const cents = Math.round(Math.max(0, Number(total) || 0) * 100);
    if (cents === 0) return weights.map(() => 0);

    const safeWeights = weights.map((weight) => Math.max(0, Number(weight) || 0));
    const weightSum = safeWeights.reduce((sum, weight) => sum + weight, 0);
    if (weightSum <= 0) {
        const base = Math.floor(cents / n);
        const remainder = cents - base * n;
        return safeWeights.map((_, index) => (base + (index < remainder ? 1 : 0)) / 100);
    }

    const raw = safeWeights.map((weight) => (cents * weight) / weightSum);
    const floors = raw.map((value) => Math.floor(value));
    let leftover = cents - floors.reduce((sum, value) => sum + value, 0);
    const order = raw
        .map((value, index) => ({ index, frac: value - Math.floor(value) }))
        .sort((a, b) => b.frac - a.frac);
    const next = [...floors];
    for (let i = 0; i < leftover; i += 1) {
        next[order[i % n].index] += 1;
    }
    return next.map((value) => value / 100);
}
