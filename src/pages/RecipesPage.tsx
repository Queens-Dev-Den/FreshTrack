import { useState } from 'react';
import { Search, ChefHat, Clock, AlertCircle, Check } from 'lucide-react';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { useRecipeMatcher } from '@/hooks/useRecipeMatcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const RecipesPage = () => {
    const { items: inventory, markAs } = useGroceryItems();
    const potentialRecipes = useRecipeMatcher(inventory);
    const [search, setSearch] = useState('');

    const filteredRecipes = potentialRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(search.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCook = (recipeId: string, usedIngredients: string[]) => {
        // Find actual grocery items to mark as consumed
        // This is tricky because we only matched by name string in the hook
        // We need to find the grocery items again here.

        let consumeCount = 0;
        const normalizedUsed = new Set(usedIngredients.map(i => i.toLowerCase().replace(/s$/, '')));

        // Naive consumption: Consume the first item that matches loosely
        // In a real app we'd ask user to confirm WHICH "Cheese" to consume if they have multiple.

        const itemsToConsume: string[] = [];

        inventory.forEach(item => {
            const norm = item.name.toLowerCase().replace(/s$/, '');
            // Check if this item is in the used list
            // This logic is a bit broad, but suffices for "Cook This" button action
            // Ideally we pass the exact GroceryItem IDs from the matcher.
            const matchedIng = Array.from(normalizedUsed).find(ing => norm.includes(ing) || ing.includes(norm));

            if (matchedIng) {
                itemsToConsume.push(item.id);
                normalizedUsed.delete(matchedIng); // Don't consume same ingredient twice from different items? 
                // Wait, if recipe needs 2 eggs and we have 1 carton (qty 12), we consume the carton?
                // Current app logic: 'consumed' marks whole item as gone.
                // Partial consumption is handled in item details.
                // For now, let's just toast what *would* happen or mark them.
            }
        });

        if (itemsToConsume.length > 0) {
            itemsToConsume.forEach(id => markAs(id, 'consumed'));
            toast.success(`Marked ${itemsToConsume.length} items as consumed`);
        } else {
            toast('No matching items found to consume automatically.');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ChefHat className="h-6 w-6 text-orange-500" />
                        Recipes
                    </h1>
                </div>
                <div className="max-w-3xl mx-auto mt-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search recipes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {filteredRecipes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No recipes found matching your inventory.</p>
                        <p className="text-sm mt-1">Try adding common items like Eggs, Chicken, or Rice.</p>
                    </div>
                ) : (
                    filteredRecipes.map(recipe => (
                        <Card key={recipe.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle>{recipe.name}</CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {recipe.cookTime}m
                                            </span>
                                            <span>•</span>
                                            <span className={recipe.missingIngredients.length === 0 ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                                                {recipe.missingIngredients.length === 0 ? 'Ready to Cok' : `${recipe.missingIngredients.length} missing`}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant={recipe.missingIngredients.length === 0 ? "default" : "secondary"}>
                                        {(recipe.matchPercentage * 100).toFixed(0)}% Match
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Ingredients Bar */}
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${recipe.matchPercentage * 100}%` }}
                                        />
                                    </div>

                                    <div className="grid gap-1 text-sm">
                                        <div className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">Have</div>
                                        {recipe.usedIngredients.map(ing => (
                                            <div key={ing} className="flex items-center gap-2 text-green-700">
                                                <Check className="h-3.5 w-3.5" />
                                                {ing}
                                            </div>
                                        ))}

                                        {recipe.missingIngredients.length > 0 && (
                                            <>
                                                <div className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1 mt-2">Missing</div>
                                                {recipe.missingIngredients.map(ing => (
                                                    <div key={ing} className="flex items-center gap-2 text-muted-foreground opacity-70">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        {ing}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>

                                    {/* (Cook This button removed per user request) */}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </main>
        </div>
    );
};

export default RecipesPage;
