import { useAuth } from "@/hooks/useAuth";
import TopNavigation from "@/components/layout/top-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import HeroSection from "@/components/common/hero-section";
import CategoryFilter from "@/components/common/category-filter";
import PromotionBanner from "@/components/common/promotion-banner";
import RestaurantCard from "@/components/restaurant/restaurant-card";
import MenuItemCard from "@/components/menu/menu-item-card";
import OrderTracker from "@/components/order/order-tracker";
import { useQuery } from "@tanstack/react-query";
import { Restaurant, MenuItem, Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const activeOrder = orders.find(order => 
    ['confirmed', 'preparing', 'ready', 'picked_up', 'delivering'].includes(order.status)
  );

  const featuredMenuItems: MenuItem[] = [
    {
      id: 1,
      name: "ผัดไทยกุ้งสด",
      description: "ผัดไทยสูตรต้นตำรับ",
      price: "120",
      imageUrl: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=300&h=200&fit=crop",
      category: "thai",
      isAvailable: true,
      restaurantId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "ต้มยำกุ้งน้ำใส",
      description: "ต้มยำรสจัดจ้าน",
      price: "95",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop",
      category: "thai",
      isAvailable: true,
      restaurantId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Salmon Roll",
      description: "ซูชิแซลมอนสด",
      price: "280",
      imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300&h=200&fit=crop",
      category: "japanese",
      isAvailable: true,
      restaurantId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Margherita Pizza",
      description: "พิซซ่าคลาสสิก",
      price: "320",
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop",
      category: "italian",
      isAvailable: true,
      restaurantId: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const categories = [
    { id: "all", name: "ทั้งหมด", icon: "🍽️" },
    { id: "thai", name: "อาหารไทย", icon: "🌶️" },
    { id: "pizza", name: "พิซซ่า", icon: "🍕" },
    { id: "burger", name: "เบอร์เกอร์", icon: "🍔" },
    { id: "dessert", name: "ของหวาน", icon: "🍨" },
    { id: "drinks", name: "เครื่องดื่ม", icon: "☕" },
  ];

  if (restaurantsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="pb-20 md:pb-0">
        <HeroSection />
        
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {activeOrder && (
          <div className="py-4 bg-accent/10 border-b">
            <div className="container mx-auto px-4">
              <OrderTracker order={activeOrder} />
            </div>
          </div>
        )}

        <PromotionBanner />

        {/* Popular Restaurants */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">ร้านอาหารยอดนิยม</h2>
              <Button variant="ghost" className="text-primary hover:text-primary/90">
                ดูทั้งหมด
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Menu Items */}
        <section className="py-6 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-6 text-gray-800">เมนูแนะนำ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredMenuItems.map((item) => (
                <MenuItemCard key={item.id} menuItem={item} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation />

      {/* Floating Cart Button - Desktop */}
      <Button className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors hidden md:flex items-center space-x-2">
        <span className="text-xl">🛒</span>
        <span className="font-medium">2 รายการ</span>
        <span className="bg-white text-primary px-2 py-1 rounded text-sm font-bold">฿405</span>
      </Button>
    </div>
  );
}
