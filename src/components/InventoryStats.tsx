import { Package, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { GroceryItem } from '@/hooks/useGroceryItems';
import { getExpiryStatus } from '@/lib/groceryDefaults';

interface InventoryStatsProps {
  items: GroceryItem[];
}

const InventoryStats = ({ items }: InventoryStatsProps) => {
  const urgent = items.filter(i => getExpiryStatus(new Date(i.expiry_date)) === 'urgent').length;
  const warning = items.filter(i => getExpiryStatus(new Date(i.expiry_date)) === 'warning').length;
  const stable = items.filter(i => getExpiryStatus(new Date(i.expiry_date)) === 'stable').length;

  const stats = [
    { label: 'Total Items', value: items.length, icon: Package, color: 'text-foreground' },
    { label: 'Expiring Soon', value: urgent, icon: AlertCircle, color: 'text-destructive' },
    { label: 'Use Soon', value: warning, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Fresh', value: stable, icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
          <stat.icon className={`h-5 w-5 flex-shrink-0 ${stat.color}`} />
          <div>
            <p className="text-xl font-semibold leading-none">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;
