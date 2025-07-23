import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Restaurant } from "@shared/schema";
import { Star, Clock, Truck } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const handleClick = () => {
    window.location.href = `/restaurant/${restaurant.id}`;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleClick}
    >
      {/* Restaurant Image */}
      <div className="relative h-48 overflow-hidden">
        {restaurant.imageUrl ? (
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-4xl opacity-60">🏪</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
            {restaurant.isOpen ? "เปิด" : "ปิด"}
          </Badge>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1">
          <div className="flex items-center space-x-1 text-white text-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{parseFloat(restaurant.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Restaurant Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1">
            {restaurant.cuisine || 'อาหารทั่วไป'}
          </p>
        </div>

        {/* Delivery Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Truck className="h-4 w-4" />
            <span>
              {parseFloat(restaurant.deliveryFee) === 0 
                ? 'ฟรีค่าส่ง' 
                : `฿${parseFloat(restaurant.deliveryFee).toFixed(0)} ค่าส่ง`
              }
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            สั่งขั้นต่ำ ฿{parseFloat(restaurant.minimumOrder).toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">
            ระยะทาง ~2 กม.
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {restaurant.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
