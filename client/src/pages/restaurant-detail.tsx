import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TopNavigation from "@/components/layout/top-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import MenuItemCard from "@/components/menu/menu-item-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Restaurant, MenuItem } from "@shared/schema";
import { CartItem } from "@/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const orderSchema = z.object({
  restaurantId: z.number(),
  totalAmount: z.string(),
  deliveryFee: z.string(),
  deliveryAddress: z.string().min(1, "กรุณาใส่ที่อยู่จัดส่ง"),
  notes: z.string().optional(),
  paymentMethod: z.string().default("cash"),
  items: z.array(z.object({
    menuItemId: z.number(),
    quantity: z.number(),
    price: z.string(),
    notes: z.string().optional(),
  })),
});

export default function RestaurantDetail() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const restaurantId = parseInt(params.id || "0");

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", restaurantId, "menu"],
    enabled: !!restaurantId,
  });

  const orderForm = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      restaurantId: restaurantId,
      totalAmount: "0",
      deliveryFee: restaurant?.deliveryFee || "0",
      deliveryAddress: user?.address || "",
      notes: "",
      paymentMethod: "cash",
      items: [],
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof orderSchema>) => {
      await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setCart([]);
      setIsOrderDialogOpen(false);
      toast({ title: "สำเร็จ", description: "สั่งซื้อเรียบร้อยแล้ว" });
      setTimeout(() => {
        window.location.href = "/customer";
      }, 1000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "เกิดข้อผิดพลาด", 
        description: "ไม่สามารถสั่งซื้อได้",
        variant: "destructive" 
      });
    },
  });

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItemId === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: parseFloat(menuItem.price),
        quantity: 1,
        imageUrl: menuItem.imageUrl,
      }]);
    }
    toast({ title: "เพิ่มลงตะกร้าแล้ว", description: menuItem.name });
  };

  const removeFromCart = (menuItemId: number) => {
    setCart(cart.filter(item => item.menuItemId !== menuItemId));
  };

  const updateCartQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(cart.map(item => 
      item.menuItemId === menuItemId 
        ? { ...item, quantity }
        : item
    ));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = parseFloat(restaurant?.deliveryFee || "0");
  const total = subtotal + deliveryFee;

  const handleOrder = () => {
    if (cart.length === 0) {
      toast({ title: "ตะกร้าว่าง", description: "กรุณาเลือกสินค้าก่อนสั่งซื้อ", variant: "destructive" });
      return;
    }
    if (!user || user.role !== 'customer') {
      toast({ title: "ไม่สามารถสั่งซื้อได้", description: "กรุณาเข้าสู่ระบบในฐานะลูกค้า", variant: "destructive" });
      return;
    }
    setIsOrderDialogOpen(true);
  };

  const submitOrder = (data: z.infer<typeof orderSchema>) => {
    const orderData = {
      ...data,
      restaurantId: restaurantId,
      totalAmount: total.toString(),
      deliveryFee: deliveryFee.toString(),
      items: cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price.toString(),
        notes: item.notes || "",
      })),
    };
    createOrderMutation.mutate(orderData);
  };

  useEffect(() => {
    if (restaurant) {
      orderForm.setValue("deliveryFee", restaurant.deliveryFee);
    }
  }, [restaurant, orderForm]);

  if (restaurantLoading || menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">ไม่พบร้านอาหาร</h1>
          <Button onClick={() => window.location.href = "/"}>กลับหน้าหลัก</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="pb-20 md:pb-0">
        {/* Restaurant Header */}
        <div className="relative">
          <div className="h-48 md:h-64 bg-gradient-to-r from-primary to-orange-400">
            {restaurant.imageUrl ? (
              <img 
                src={restaurant.imageUrl} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                🏪
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="container mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-lg opacity-90 mb-2">{restaurant.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span>⭐</span>
                  <span>{parseFloat(restaurant.rating).toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🕒</span>
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🚚</span>
                  <span>฿{parseFloat(restaurant.deliveryFee).toFixed(2)} ค่าส่ง</span>
                </div>
                <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                  {restaurant.isOpen ? "เปิด" : "ปิด"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">ที่อยู่</h3>
                  <p className="text-sm text-gray-600">{restaurant.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">โทรศัพท์</h3>
                  <p className="text-sm text-gray-600">{restaurant.phone || "ไม่ระบุ"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">ประเภทอาหาร</h3>
                  <p className="text-sm text-gray-600">{restaurant.cuisine || "อื่นๆ"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">เมนูอาหาร</h2>
            {menuItems.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-8">
                  <div className="text-4xl mb-4">🍽️</div>
                  <h3 className="text-lg font-semibold mb-2">ยังไม่มีเมนู</h3>
                  <p className="text-gray-600">ร้านนี้ยังไม่ได้เพิ่มเมนูอาหาร</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    menuItem={item} 
                    onAddToCart={() => addToCart(item)}
                    inCart={cart.some(cartItem => cartItem.menuItemId === item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNavigation />

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <Button 
          className="fixed bottom-20 md:bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 z-40"
          onClick={handleOrder}
        >
          <span className="text-xl">🛒</span>
          <span className="font-medium">{cart.length} รายการ</span>
          <span className="bg-white text-primary px-2 py-1 rounded text-sm font-bold">
            ฿{total.toFixed(2)}
          </span>
        </Button>
      )}

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ยืนยันการสั่งซื้อ</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Cart Items */}
            <div>
              <h3 className="font-semibold mb-2">รายการสั่งซื้อ</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <span>{item.name}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateCartQuantity(item.menuItemId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="text-xs">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateCartQuantity(item.menuItemId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <span className="font-medium">฿{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-2">
              <div className="flex justify-between text-sm">
                <span>ราคาอาหาร</span>
                <span>฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ค่าส่ง</span>
                <span>฿{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>รวมทั้งหมด</span>
                <span>฿{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Form */}
            <Form {...orderForm}>
              <form onSubmit={orderForm.handleSubmit(submitOrder)} className="space-y-4">
                <FormField
                  control={orderForm.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่จัดส่ง</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="กรุณาใส่ที่อยู่จัดส่ง" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมายเหตุ (ไม่บังคับ)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="คำขอพิเศษหรือหมายเหตุ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsOrderDialogOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "กำลังสั่งซื้อ..." : "สั่งซื้อ"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
