export const hashString = (value) => {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
};

export const createRng = (seed) => {
    let value = seed >>> 0;

    return () => {
        value += 0x6D2B79F5;
        let mixed = value;
        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
};

export const pick = (items, rng) => items[Math.floor(rng() * items.length)];

export const numberBetween = (min, max, rng) => Math.floor(rng() * (max - min + 1)) + min;

export const decimalBetween = (min, max, rng) => Number((rng() * (max - min) + min).toFixed(1));
