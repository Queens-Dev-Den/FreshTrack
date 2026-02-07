export interface CacheItem<T> {
    value: T;
    expiry: number;
}

export const CACHE_KEYS = {
    PRODUCT_LOOKUP: 'product_lookup_',
    USER_OVERRIDES: 'user_product_overrides_',
};

const DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export const localCache = {
    setWithTTL: <T>(key: string, value: T, ttlMs: number = DEFAULT_TTL): void => {
        const item: CacheItem<T> = {
            value,
            expiry: Date.now() + ttlMs,
        };
        try {
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            console.warn('Failed to save to localStorage', e);
        }
    },

    getWithTTL: <T>(key: string): T | null => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
            const item: CacheItem<T> = JSON.parse(itemStr);
            if (Date.now() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            return item.value;
        } catch (e) {
            console.warn('Failed to parse from localStorage', e);
            return null;
        }
    },

    getOverrides: (barcode: string) => {
        const key = `${CACHE_KEYS.USER_OVERRIDES}${barcode}`;
        return localCache.getWithTTL<{
            nameOverride?: string;
            categoryOverride?: string;
            shelfLifeDaysOverride?: number;
        }>(key);
    },

    saveOverride: (barcode: string, overrides: {
        nameOverride?: string;
        categoryOverride?: string;
        shelfLifeDaysOverride?: number;
    }) => {
        const key = `${CACHE_KEYS.USER_OVERRIDES}${barcode}`;
        const existing = localCache.getOverrides(barcode) || {};
        localCache.setWithTTL(key, { ...existing, ...overrides });
    }
};
