import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Restaurant, Order, Delivery } from "@shared/schema";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "You need to be an admin to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isLoading, toast]);

  const { data: restaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: deliveries = [] } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
    enabled: !!user && user.role === 'admin',
  });

  const getStatusColor = (status: string, type: 'order' | 'delivery' = 'order') => {
    if (type === 'delivery') {
      switch (status) {
        case 'delivered':
          return 'bg-success text-white';
        case 'failed':
          return 'bg-destructive text-white';
        case 'en_route':
          return 'bg-primary text-white';
        case 'picked_up':
          return 'bg-warning text-white';
        default:
          return 'bg-gray-500 text-white';
      }
    }
    
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

  const getStatusText = (status: string, type: 'order' | 'delivery' = 'order') => {
    if (type === 'delivery') {
      switch (status) {
        case 'assigned':
          return 'รับงานแล้ว';
        case 'picked_up':
          return 'เก็บของแล้ว';
        case 'en_route':
          return 'กำลังส่ง';
        case 'delivered':
          return 'ส่งแล้ว';
        case 'failed':
          return 'ส่งไม่สำเร็จ';
        default:
          return status;
      }
    }
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">แดชบอร์ดแอดมิน</h1>
          <p className="text-gray-600">ภาพรวมระบบและการจัดการ</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <span className="text-success font-bold">📋</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-gray-600">ออเดอร์ทั้งหมด</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <span className="text-warning font-bold">🚚</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{deliveries.length}</p>
                  <p className="text-sm text-gray-600">การส่งของ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">💰</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">฿{totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">รายได้รวม</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Today's Overview */}
          <Card>
            <CardHeader>
              <CardTitle>สถิติวันนี้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ออเดอร์วันนี้</span>
                  <span className="font-bold">{todayOrders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">รายได้วันนี้</span>
                  <span className="font-bold">
                    ฿{todayOrders
                      .filter(order => order.status === 'delivered')
                      .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ร้านที่เปิด</span>
                  <span className="font-bold">
                    {restaurants.filter(restaurant => restaurant.isOpen).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">การส่งที่กำลังดำเนินการ</span>
                  <span className="font-bold">
                    {deliveries.filter(delivery => 
                      ['assigned', 'picked_up', 'en_route'].includes(delivery.status)
                    ).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>สถานะออเดอร์</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'].map(status => {
                  const count = orders.filter(order => order.status === status).length;
                  const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(status)}>
                          {getStatusText(status)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ออเดอร์ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>ยอดรวม</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>เวลา</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 10).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{order.customerId.slice(0, 8)}...</TableCell>
                    <TableCell>฿{parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/order/${order.id}`}
                      >
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Restaurants */}
        <Card>
          <CardHeader>
            <CardTitle>ร้านอาหาร</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อร้าน</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>เรตติ้ง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>เจ้าของ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell>{restaurant.cuisine || 'N/A'}</TableCell>
                    <TableCell>
                      ⭐ {parseFloat(restaurant.rating).toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                        {restaurant.isOpen ? "เปิด" : "ปิด"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {restaurant.ownerId ? restaurant.ownerId.slice(0, 8) + '...' : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
