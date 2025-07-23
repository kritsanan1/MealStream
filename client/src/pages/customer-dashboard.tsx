import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/layout/top-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@shared/schema";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'customer')) {
      toast({
        title: "Unauthorized",
        description: "You need to be a customer to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isLoading, toast]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user && user.role === 'customer',
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

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">สวัสดี {user?.firstName || 'ลูกค้า'}!</h1>
          <p className="text-gray-600">จัดการออเดอร์และติดตามการส่งของคุณ</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">📋</span>
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <span className="text-warning font-bold">🚚</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter(order => 
                      ['confirmed', 'preparing', 'ready', 'picked_up', 'delivering'].includes(order.status)
                    ).length}
                  </p>
                  <p className="text-sm text-gray-600">กำลังดำเนินการ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>ออเดอร์ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold mb-2">ยังไม่มีออเดอร์</h3>
                <p className="text-gray-600 mb-4">เริ่มสั่งอาหารจากร้านโปรดของคุณ</p>
                <Button onClick={() => window.location.href = "/"}>
                  เริ่มสั่งอาหาร
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">#{order.id.slice(0, 8)}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        ยอดรวม: ฿{parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/order/${order.id}`}
                    >
                      ดูรายละเอียด
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
