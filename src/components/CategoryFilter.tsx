import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/groceryDefaults';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
  itemCounts: Record<string, number>;
}

const CategoryFilter = ({ selected, onSelect, itemCounts }: CategoryFilterProps) => {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      <Button
        size="sm"
        variant={selected === null ? 'default' : 'outline'}
        onClick={() => onSelect(null)}
        className="text-xs whitespace-nowrap h-7 px-2.5"
      >
        All
      </Button>
      {CATEGORIES.filter((cat) => (itemCounts[cat] || 0) > 0).map((cat) => (
        <Button
          key={cat}
          size="sm"
          variant={selected === cat ? 'default' : 'outline'}
          onClick={() => onSelect(selected === cat ? null : cat)}
          className="text-xs whitespace-nowrap h-7 px-2.5"
        >
          {cat} ({itemCounts[cat] || 0})
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
