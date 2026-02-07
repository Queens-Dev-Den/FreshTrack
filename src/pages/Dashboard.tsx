import { useState, useMemo } from 'react';
import { LogOut, Refrigerator, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGroceryItems } from '@/hooks/useGroceryItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddItemDialog from '@/components/AddItemDialog';
import GroceryItemCard from '@/components/GroceryItemCard';
import InventoryStats from '@/components/InventoryStats';
import CategoryFilter from '@/components/CategoryFilter';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const { items, loading, addItem, markAs } = useGroceryItems();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Refrigerator className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-lg">FreshTrack</h1>
          </div>
          <div className="flex items-center gap-2">
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
            <Refrigerator className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
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
              <GroceryItemCard key={item.id} item={item} onMarkAs={markAs} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
