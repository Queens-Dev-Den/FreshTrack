import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CATEGORIES, UNITS } from '@/lib/groceryDefaults';
import { GroceryItem } from '@/hooks/useGroceryItems';
import { parseLocalDate } from '@/lib/dateUtils';

interface EditItemDialogProps {
    item: GroceryItem;
    onUpdate: (id: string, updates: Partial<Omit<GroceryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
}

const EditItemDialog = ({ item, onUpdate }: EditItemDialogProps) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(item.name);
    const [category, setCategory] = useState(item.category);
    const [quantity, setQuantity] = useState(item.quantity);
    const [unit, setUnit] = useState(item.unit);
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(item.expiry_date ? parseLocalDate(item.expiry_date) : undefined);
    const [notes, setNotes] = useState(item.notes || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !expiryDate) return;
        setLoading(true);
        await onUpdate(item.id, {
            name: name.trim(),
            category,
            quantity,
            unit,
            expiry_date: format(expiryDate, 'yyyy-MM-dd'),
            notes: notes.trim() || null,
        });
        setLoading(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Category</label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Quantity</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                            </div>
                            <div className="w-24">
                                <label className="text-sm font-medium mb-1 block">Unit</label>
                                <Select value={unit} onValueChange={setUnit}>
                                    <SelectTrigger>
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

                    <div>
                        <label className="text-sm font-medium mb-1 block">Expiry Date</label>
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
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Notes</label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional notes"
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={!name.trim() || !expiryDate || loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditItemDialog;
