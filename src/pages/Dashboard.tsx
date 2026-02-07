import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Scan } from 'lucide-react';
import { FridgeIcon } from '@/components/CustomIcons';
import { useAuth } from '@/hooks/useAuth';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddItemDialog from '@/components/AddItemDialog';
import GroceryItemCard from '@/components/GroceryItemCard';
import InventoryStats from '@/components/InventoryStats';
import CategoryFilter from '@/components/CategoryFilter';
import { Loader2 } from 'lucide-react';
import { BarcodeScannerModal } from '@/features/scan/BarcodeScannerModal';
import { lookupProduct } from '@/services/productApi';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { items, loading, addItem, updateItem, markAs } = useGroceryItems();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleBarcodeDetected = async (barcode: string) => {
    const toastId = toast.loading('Looking up product...');
    try {
      const product = await lookupProduct(barcode);
      toast.dismiss(toastId);
      navigate('/add/confirm', {
        state: {
          barcode,
          product
        }
      });
    } catch (error) {
      console.error('Lookup failed', error);
      toast.dismiss(toastId);
      // Navigate even if lookup fails, user will fill in details
      navigate('/add/confirm', { state: { barcode } });
    }
  };

  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FridgeIcon className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-lg">FreshTrack</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => setIsScannerOpen(true)} title="Scan Item">
              <Scan className="h-5 w-5" />
            </Button>
            <AddItemDialog onAdd={addItem} />
            <Button size="icon" variant="ghost" onClick={signOut} title="Sign out" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <InventoryStats items={items} />

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <CategoryFilter
            selected={categoryFilter}
            onSelect={setCategoryFilter}
            itemCounts={categoryItemCounts}
          />
        </div>

        {/* Item List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <FridgeIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">
              {items.length === 0 ? 'Your inventory is empty' : 'No items match your filters'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {items.length === 0 ? 'Add your first grocery item to start tracking.' : 'Try adjusting your search or category filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <GroceryItemCard key={item.id} item={item} onMarkAs={markAs} onUpdate={updateItem} />
            ))}
          </div>
        )}
      </main>

      <BarcodeScannerModal
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onDetected={handleBarcodeDetected}
      />
    </div>
  );
};

export default Dashboard;
