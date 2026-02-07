import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface GroceryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_date: string;
  expiry_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useGroceryItems() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('status', 'active')
      .order('expiry_date', { ascending: true });

    if (error) {
      toast({ title: 'Error loading items', description: error.message, variant: 'destructive' });
    } else {
      setItems(data as GroceryItem[]);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    purchase_date: string;
    expiry_date: string;
    notes?: string;
  }) => {
    if (!user) return;
    const { error } = await supabase.from('grocery_items').insert({
      ...item,
      user_id: user.id,
      status: 'active',
    });

    if (error) {
      toast({ title: 'Error adding item', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Item added', description: `${item.name} added to your inventory.` });
      fetchItems();
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<GroceryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const { error } = await supabase
      .from('grocery_items')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating item', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Item updated' });
      fetchItems();
    }
  };

  const markAs = async (id: string, status: 'consumed' | 'discarded') => {
    const { error } = await supabase
      .from('grocery_items')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating item', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: status === 'consumed' ? 'Marked as consumed' : 'Marked as discarded',
        description: status === 'consumed' ? 'Great, less waste!' : 'Tracked for your waste report.',
      });
      fetchItems();
    }
  };

  return { items, loading, addItem, updateItem, markAs, refetch: fetchItems };
}
