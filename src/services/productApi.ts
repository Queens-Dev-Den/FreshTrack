import { localCache, CACHE_KEYS } from '@/storage/localCache';

export interface ProductLookupResult {
    name: string;
    brand?: string;
    size?: string;
    category?: string; // Normalized category (e.g., 'dairy', 'produce')
    imageUrl?: string;
    source: 'api' | 'cache' | 'user';
}

const API_BASE_URL = import.meta.env.VITE_PRODUCT_API_BASE_URL || 'https://world.openfoodfacts.org/api/v0/product';
// Note: OpenFoodFacts is free and doesn't explicitly require a key for basic usage, 
// but it's good practice to set a User-Agent or use an API key if using a commercial provider.

// Map raw categories to our app's simplified categories
const normalizeCategory = (rawCategory: string = ''): string => {
    const lower = rawCategory.toLowerCase();
    if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('dairy')) return 'Dairy';
    if (lower.includes('bread') || lower.includes('bakery')) return 'Bakery';
    if (lower.includes('meat') || lower.includes('beef') || lower.includes('chicken') || lower.includes('pork')) return 'Meat';
    if (lower.includes('fruit') || lower.includes('vegetable') || lower.includes('produce')) return 'Produce';
    if (lower.includes('frozen')) return 'Frozen';
    if (lower.includes('canned') || lower.includes('pantry') || lower.includes('sauce') || lower.includes('pasta')) return 'Pantry';
    return 'Other';
};

export const lookupProduct = async (barcode: string): Promise<ProductLookupResult | null> => {
    // 1. Check for user overrides first
    const overrides = localCache.getOverrides(barcode);

    // 2. Check local cache
    const cacheKey = `${CACHE_KEYS.PRODUCT_LOOKUP}${barcode}`;
    const cached = localCache.getWithTTL<ProductLookupResult>(cacheKey);

    if (cached) {
        return {
            ...cached,
            source: 'cache',
            // Apply overrides if any
            name: overrides?.nameOverride || cached.name,
            category: overrides?.categoryOverride || cached.category,
        };
    }

    // 3. Fetch from API
    try {
        // using OpenFoodFacts as the default example provider
        const response = await fetch(`${API_BASE_URL}/${barcode}.json`);

        if (!response.ok) {
            throw new Error(`Product lookup failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === 0 || !data.product) {
            return null; // Product not found
        }

        const product = data.product;
        const result: ProductLookupResult = {
            name: product.product_name || 'Unknown Product',
            brand: product.brands,
            size: product.quantity,
            category: normalizeCategory(product.categories),
            imageUrl: product.image_front_small_url || product.image_front_url,
            source: 'api',
        };

        // 4. Cache the result
        localCache.setWithTTL(cacheKey, result);

        // Apply overrides
        if (overrides) {
            return {
                ...result,
                name: overrides.nameOverride || result.name,
                category: overrides.categoryOverride || result.category,
            }
        }

        return result;

    } catch (error) {
        console.error('Error looking up product:', error);
        return null;
    }
};
