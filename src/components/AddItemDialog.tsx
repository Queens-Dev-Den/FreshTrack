import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CATEGORIES, UNITS, getSmartExpiry } from '@/lib/groceryDefaults';

interface AddItemDialogProps {
  onAdd: (item: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    purchase_date: string;
    expiry_date: string;
    notes?: string;
  }) => Promise<void>;
}

const AddItemDialog = ({ onAdd }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Other');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('item');
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [smartSuggestion, setSmartSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (name.length < 2) {
      setSmartSuggestion(null);
      return;
    }

    const result = getSmartExpiry(name);
    if (result) {
      const suggestedDate = addDays(new Date(), result.days);
      if (!expiryDate || smartSuggestion) {
        setExpiryDate(suggestedDate);
        setCategory(result.category);
      }
      setSmartSuggestion(`${result.days} day${result.days !== 1 ? 's' : ''} — auto-detected`);
    } else {
      setSmartSuggestion(null);
    }
  }, [name]);

  const handleSubmit = async () => {
    if (!name.trim() || !expiryDate) return;
    setLoading(true);
    await onAdd({
      name: name.trim(),
      category,
      quantity,
      unit,
      purchase_date: format(new Date(), 'yyyy-MM-dd'),
      expiry_date: format(expiryDate, 'yyyy-MM-dd'),
    });
    setLoading(false);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setName('');
    setCategory('Other');
    setQuantity(1);
    setUnit('item');
    setExpiryDate(undefined);
    setSmartSuggestion(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add grocery item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Input
              placeholder="Item name (e.g. Milk, Spinach, Apples)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {smartSuggestion && (
              <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                Smart Expiry: {smartSuggestion}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!name.trim() || !expiryDate || loading}
          >
            {loading ? 'Adding...' : 'Add to inventory'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
