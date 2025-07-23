import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@shared/schema";
import { Plus, Check } from "lucide-react";

interface MenuItemCardProps {
  menuItem: MenuItem;
  onAddToCart?: () => void;
  inCart?: boolean;
}

export default function MenuItemCard({ menuItem, onAddToCart, inCart = false }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Menu Item Image */}
      <div className="relative h-40 overflow-hidden">
        {menuItem.imageUrl ? (
          <img 
            src={menuItem.imageUrl} 
            alt={menuItem.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <span className="text-3xl opacity-60">🍽️</span>
          </div>
        )}
        
        {/* Availability Badge */}
        {!menuItem.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              หมด
            </Badge>
          </div>
        )}

        {/* Category Badge */}
        {menuItem.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {menuItem.category}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Menu Item Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
            {menuItem.name}
          </h3>
          {menuItem.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {menuItem.description}
            </p>
          )}
        </div>

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              ฿{parseFloat(menuItem.price).toFixed(2)}
            </span>
          </div>
          
          {onAddToCart && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={!menuItem.isAvailable}
              className={`${
                inCart 
                  ? 'bg-success hover:bg-success/90' 
                  : 'bg-primary hover:bg-primary/90'
              } text-white`}
            >
              {inCart ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  เพิ่มแล้ว
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  เพิ่ม
                </>
              )}
            </Button>
          )}
        </div>

        {/* Availability Status */}
        <div className="mt-2">
          <Badge 
            variant={menuItem.isAvailable ? "default" : "secondary"}
            className="text-xs"
          >
            {menuItem.isAvailable ? "มีจำหน่าย" : "หมด"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
