import { format } from 'date-fns';
import { Check, Trash2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GroceryItem } from '@/hooks/useGroceryItems';
import { getExpiryStatus, getDaysRemaining } from '@/lib/groceryDefaults';

interface GroceryItemCardProps {
  item: GroceryItem;
  onMarkAs: (id: string, status: 'consumed' | 'discarded') => void;
}

const categoryEmoji: Record<string, string> = {
  Dairy: '🥛',
  Produce: '🥬',
  Bakery: '🍞',
  'Meat & Seafood': '🥩',
  Frozen: '🧊',
  Beverages: '🥤',
  'Canned Goods': '🥫',
  Snacks: '🍿',
  Condiments: '🫙',
  'Grains & Pasta': '🍝',
  Other: '📦',
};

const GroceryItemCard = ({ item, onMarkAs }: GroceryItemCardProps) => {
  const status = getExpiryStatus(new Date(item.expiry_date));
  const daysLeft = getDaysRemaining(new Date(item.expiry_date));

  const statusConfig = {
    urgent: {
      label: daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`,
      icon: AlertCircle,
      className: 'status-urgent',
    },
    warning: {
      label: `${daysLeft}d left`,
      icon: AlertTriangle,
      className: 'status-warning',
    },
    stable: {
      label: `${daysLeft}d left`,
      icon: Clock,
      className: 'status-stable',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const emoji = categoryEmoji[item.category] || '📦';

  return (
    <div className={`group flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-all ${
      status === 'urgent' ? 'border-destructive/30 bg-destructive/[0.02]' :
      status === 'warning' ? 'border-warning/30 bg-warning/[0.02]' : ''
    }`}>
      <div className="text-xl flex-shrink-0">{emoji}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{item.name}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${config.className}`}>
            <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{item.category}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {item.quantity} {item.unit}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            Exp {format(new Date(item.expiry_date), 'MMM d')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => onMarkAs(item.id, 'consumed')}
          title="Mark as consumed"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onMarkAs(item.id, 'discarded')}
          title="Mark as discarded"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default GroceryItemCard;
