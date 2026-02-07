import { useMemo } from 'react';
import { GroceryItem } from '@/hooks/useGroceryItems';
import recipesData from '@/data/recipes.json';

export interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    cookTime: number;
}

export interface RecipeMatch extends Recipe {
    usedIngredients: string[];
    missingIngredients: string[];
    matchPercentage: number;
}

// Helper to normalize ingredient names (singularize, lowercase)
const normalize = (str: string) => {
    return str.toLowerCase()
        .replace(/s$/, '') // simple singularization
        .replace(/es$/, '')
        .trim();
};

export const useRecipeMatcher = (inventory: GroceryItem[]) => {
    const matches = useMemo(() => {
        // 1. Create a set of normalized inventory items for O(1) lookup
        const inventorySet = new Set<string>();
        inventory.forEach(item => {
            inventorySet.add(normalize(item.name));
            // Also add category as a fallback? strict for now
        });

        const results: RecipeMatch[] = recipesData.map((recipe) => {
            const used: string[] = [];
            const missing: string[] = [];

            recipe.ingredients.forEach((ing) => {
                const normIng = normalize(ing);
                // Check for exact match or contains
                // e.g. "Bell Pepper" in recipe, user has "Green Bell Pepper" -> match?
                // e.g. "Cheese" in recipe, user has "Cheddar Cheese" -> match logic needed

                let found = false;
                if (inventorySet.has(normIng)) {
                    found = true;
                } else {
                    // Scan array for partial matches
                    for (const item of inventory) {
                        const normItem = normalize(item.name);
                        if (normItem.includes(normIng) || normIng.includes(normItem)) {
                            found = true;
                            break;
                        }
                    }
                }

                if (found) {
                    used.push(ing);
                } else {
                    missing.push(ing);
                }
            });

            return {
                ...recipe,
                usedIngredients: used,
                missingIngredients: missing,
                matchPercentage: used.length / recipe.ingredients.length,
            };
        });

        // Valid Matches: Must have at least 1 ingredient
        const availableRecipes = results.filter(r => r.usedIngredients.length > 0);

        // Sort by:
        // 1. Fewest missing ingredients (Most "cookable" first)
        // 2. Most used ingredients count
        return availableRecipes.sort((a, b) => {
            const missingDiff = a.missingIngredients.length - b.missingIngredients.length;
            if (missingDiff !== 0) return missingDiff;
            return b.usedIngredients.length - a.usedIngredients.length;
        });

    }, [inventory]);

    return matches;
};
