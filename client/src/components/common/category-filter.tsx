import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryFilterProps) {
  return (
    <section className="py-6 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className={`flex flex-col items-center min-w-[80px] p-3 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <span className="text-xl mb-1">{category.icon}</span>
              <span className="text-xs whitespace-nowrap">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
