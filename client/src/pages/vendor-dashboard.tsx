import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TopNavigation from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Restaurant, Order, MenuItem } from "@shared/schema";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const menuItemSchema = z.object({
  name: z.string().min(1, "กรุณาใส่ชื่อเมนู"),
  description: z.string().optional(),
  price: z.string().min(1, "กรุณาใส่ราคา"),
  category: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  restaurantId: z.number(),
});

const restaurantSchema = z.object({
  name: z.string().min(1, "กรุณาใส่ชื่อร้าน"),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  address: z.string().min(1, "กรุณาใส่ที่อยู่"),
  phone: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  deliveryTime: z.string().default("30-45 min"),
  deliveryFee: z.string().default("0"),
  minimumOrder: z.string().default("0"),
});

export default function VendorDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'vendor')) {
      toast({
        title: "Unauthorized",
        description: "You need to be a vendor to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isLoading, toast]);

  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
    enabled: !!user && user.role === 'vendor',
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user && user.role === 'vendor',
  });

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", selectedRestaurant, "menu"],
    enabled: !!selectedRestaurant,
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: z.infer<typeof restaurantSchema>) => {
      await apiRequest("POST", "/api/restaurants", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({ title: "สำเร็จ", description: "สร้างร้านอาหารเรียบร้อยแล้ว" });
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
        description: "ไม่สามารถสร้างร้านอาหารได้",
        variant: "destructive" 
      });
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof menuItemSchema>) => {
      await apiRequest("POST", "/api/menu-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant, "menu"] });
      toast({ title: "สำเร็จ", description: "เพิ่มเมนูเรียบร้อยแล้ว" });
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
        description: "ไม่สามารถเพิ่มเมนูได้",
        variant: "destructive" 
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "สำเร็จ", description: "อัปเดตสถานะออเดอร์เรียบร้อยแล้ว" });
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
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive" 
      });
    },
  });

  const restaurantForm = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      description: "",
      cuisine: "",
      address: "",
      phone: "",
      imageUrl: "",
      deliveryTime: "30-45 min",
      deliveryFee: "0",
      minimumOrder: "0",
    },
  });

  const menuForm = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      restaurantId: selectedRestaurant || 0,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success text-white';
      case 'cancelled':
        return 'bg-destructive text-white';
      case 'delivering':
        return 'bg-primary text-white';
      case 'preparing':
        return 'bg-warning text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอยืนยัน';
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'preparing':
        return 'กำลังทำ';
      case 'ready':
        return 'พร้อมส่ง';
      case 'picked_up':
        return 'เก็บแล้ว';
      case 'delivering':
        return 'กำลังส่ง';
      case 'delivered':
        return 'ส่งแล้ว';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  if (isLoading || restaurantsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">แดชบอร์ดร้านอาหาร</h1>
          <p className="text-gray-600">จัดการร้านอาหารและออเดอร์ของคุณ</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">🏪</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{restaurants.length}</p>
                  <p className="text-sm text-gray-600">ร้านอาหาร</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <span className="text-warning font-bold">📋</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter(order => order.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">รอยืนยัน</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">👨‍🍳</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter(order => ['confirmed', 'preparing'].includes(order.status)).length}
                  </p>
                  <p className="text-sm text-gray-600">กำลังทำ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <span className="text-success font-bold">✅</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter(order => order.status === 'delivered').length}
                  </p>
                  <p className="text-sm text-gray-600">ส่งสำเร็จ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restaurant Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>ร้านอาหารของคุณ</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">เพิ่มร้านใหม่</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มร้านอาหารใหม่</DialogTitle>
                  </DialogHeader>
                  <Form {...restaurantForm}>
                    <form 
                      onSubmit={restaurantForm.handleSubmit((data) => createRestaurantMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <FormField
                        control={restaurantForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ชื่อร้าน</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={restaurantForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>คำอธิบาย</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={restaurantForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ที่อยู่</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={createRestaurantMutation.isPending}
                        className="w-full"
                      >
                        {createRestaurantMutation.isPending ? "กำลังสร้าง..." : "สร้างร้าน"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {restaurants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏪</div>
                  <p className="text-gray-600">ยังไม่มีร้านอาหาร</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {restaurants.map((restaurant) => (
                    <div 
                      key={restaurant.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRestaurant === restaurant.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRestaurant(restaurant.id)}
                    >
                      <h3 className="font-semibold">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                      <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                        {restaurant.isOpen ? "เปิด" : "ปิด"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>ออเดอร์ล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-600">ยังไม่มีออเดอร์</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">#{order.id.slice(0, 8)}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        ยอดรวม: ฿{parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                      
                      {order.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'confirmed' })}
                            disabled={updateOrderMutation.isPending}
                          >
                            ยืนยัน
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'cancelled' })}
                            disabled={updateOrderMutation.isPending}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'preparing' })}
                          disabled={updateOrderMutation.isPending}
                        >
                          เริ่มทำอาหาร
                        </Button>
                      )}
                      
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'ready' })}
                          disabled={updateOrderMutation.iPending}
                        >
                          อาหารพร้อม
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Management */}
        {selectedRestaurant && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>เมนูอาหาร</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">เพิ่มเมนู</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มเมนูใหม่</DialogTitle>
                  </DialogHeader>
                  <Form {...menuForm}>
                    <form 
                      onSubmit={menuForm.handleSubmit((data) => 
                        createMenuItemMutation.mutate({ ...data, restaurantId: selectedRestaurant })
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={menuForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ชื่อเมนู</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={menuForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>คำอธิบาย</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={menuForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ราคา (บาท)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={menuForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ประเภท</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={createMenuItemMutation.isPending}
                        className="w-full"
                      >
                        {createMenuItemMutation.isPending ? "กำลังเพิ่ม..." : "เพิ่มเมนู"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {menuItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🍽️</div>
                  <p className="text-gray-600">ยังไม่มีเมนู</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">฿{parseFloat(item.price).toFixed(2)}</span>
                        <Badge variant={item.isAvailable ? "default" : "secondary"}>
                          {item.isAvailable ? "มีจำหน่าย" : "หมด"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
