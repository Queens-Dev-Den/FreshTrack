import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { CalendarIcon, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { localCache } from '@/storage/localCache';
import { ProductLookupResult } from '@/services/productApi';
import { CATEGORIES, UNITS } from '@/lib/groceryDefaults';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Default shelf life in days if specific logic fails
const SHELF_LIFE_BY_CATEGORY: Record<string, number> = {
    'Dairy': 14,
    'Produce': 7,
    'Meat & Seafood': 5,
    'Bakery': 5,
    'Frozen': 90,
    'Beverages': 30,
    'Canned Goods': 365,
    'Snacks': 60,
    'Condiments': 180,
    'Grains & Pasta': 365,
    'Other': 14,
};

const ConfirmItemPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addItem } = useGroceryItems();

    const [barcode, setBarcode] = useState<string>('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState<string>('Other');
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('item');
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initialize from navigation state
    useEffect(() => {
        const state = location.state as { barcode: string; product?: ProductLookupResult } | null;

        if (!state?.barcode) {
            toast.error('No item data found');
            navigate('/add'); // Redirect back if no state
            return;
        }

        setBarcode(state.barcode);

        if (state.product) {
            setName(state.product.name);
            if (state.product.category && CATEGORIES.includes(state.product.category as any)) {
                setCategory(state.product.category);
            }
            // If product has specific size/unit logic, could parse it here
        }

        // Set default expiry based on category (or today + default)
        const initialCategory = state.product?.category || 'Other';
        const days = SHELF_LIFE_BY_CATEGORY[initialCategory] || 7;
        setExpiryDate(addDays(new Date(), days));

    }, [location, navigate]);

    // Update expiry when category changes, if user hasn't manually picked a date (optional, strictly speaking user might find this annoying if they just picked a date, but useful for initial setup)
    // For now, let's just use the initial default to avoid overwriting user choice unless they explicitly ask for "reset"

    const handleSave = async () => {
        if (!name.trim() || !expiryDate) return;

        setIsSaving(true);
        try {
            // 1. Add to Supabase
            await addItem({
                name: name.trim(),
                category,
                quantity,
                unit,
                purchase_date: format(new Date(), 'yyyy-MM-dd'),
                expiry_date: format(expiryDate, 'yyyy-MM-dd'),
                notes: notes || `Barcode: ${barcode}`,
            });

            // 2. Save User Overrides to Local Cache
            const overrides = {
                nameOverride: name.trim(),
                categoryOverride: category,
                // Shelf life override could be calculated: days between purchase and expiry
            };
            localCache.saveOverride(barcode, overrides);

            navigate('/'); // Go back to dashboard on success
        } catch (error) {
            console.error(error);
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b px-4 py-3 sticky top-0 bg-background/95 backdrop-blur z-10 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="font-semibold text-lg">Confirm Item</h1>
            </header>

            <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-6">
                <div className="space-y-4">
                    {/* Barcode Display */}
                    <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded text-center">
                        Barcode: {barcode}
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Item Name</label>
                        <Input
                            placeholder="Product Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Category & Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={category} onValueChange={(val) => {
                                setCategory(val);
                                // Optional: Auto-update expiry based on new category if desired
                                if (expiryDate) {
                                    const days = SHELF_LIFE_BY_CATEGORY[val] || 7;
                                    setExpiryDate(addDays(new Date(), days));
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20"
                                />
                                <Select value={unit} onValueChange={setUnit}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNITS.map((u) => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Expiry Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !expiryDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {expiryDate ? format(expiryDate, 'PPP') : 'Pick expiry date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={expiryDate}
                                    onSelect={setExpiryDate}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                />
                            </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                            Suggested shelf life for {category}: {SHELF_LIFE_BY_CATEGORY[category]} days
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Input
                            placeholder="Optional notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
            </main>

            <footer className="p-4 border-t bg-background sticky bottom-0">
                <Button
                    onClick={handleSave}
                    className="w-full gap-2"
                    size="lg"
                    disabled={isSaving || !name}
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Item
                </Button>
            </footer>
        </div>
    );
};

export default ConfirmItemPage;
