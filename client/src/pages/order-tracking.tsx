import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/layout/top-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import OrderTracker from "@/components/order/order-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderWithItems } from "@/types";
import { Restaurant, MenuItem } from "@shared/schema";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function OrderTracking() {
  const params = useParams();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const orderId = params.id;

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to view order details.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, isLoading, toast]);

  const { data: orderData, isLoading: orderLoading } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId && !!user,
  });

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", orderData?.restaurantId],
    enabled: !!orderData?.restaurantId,
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ร้านอาหารยังไม่ได้ยืนยันออเดอร์ของคุณ';
      case 'confirmed':
        return 'ร้านอาหารยืนยันออเดอร์แล้ว กำลังเตรียมทำอาหาร';
      case 'preparing':
        return 'ร้านอาหารกำลังเตรียมอาหารของคุณ';
      case 'ready':
        return 'อาหารพร้อมแล้ว รอไรเดอร์มารับ';
      case 'picked_up':
        return 'ไรเดอร์รับอาหารแล้ว กำลังเดินทางไปหาคุณ';
      case 'delivering':
        return 'ไรเดอร์กำลังเดินทางมาส่งอาหารให้คุณ';
      case 'delivered':
        return 'ส่งอาหารเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ';
      case 'cancelled':
        return 'ออเดอร์ถูกยกเลิก';
      default:
        return 'กำลังอัปเดตสถานะ';
    }
  };

  if (isLoading || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-2xl font-bold mb-2">ไม่พบออเดอร์</h1>
          <p className="text-gray-600 mb-4">ออเดอร์ที่คุณค้นหาไม่มีในระบบ</p>
          <Button onClick={() => window.location.href = "/"}>กลับหน้าหลัก</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Order Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">ออเดอร์ #{orderData.id.slice(0, 8)}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  สั่งเมื่อ {new Date(orderData.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Badge className={getStatusColor(orderData.status)}>
                {getStatusText(orderData.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">สถานะปัจจุบัน</h3>
                <p className="text-gray-600">{getStatusDescription(orderData.status)}</p>
              </div>
              
              {orderData.estimatedDeliveryTime && (
                <div>
                  <h3 className="font-semibold mb-2">เวลาส่งโดยประมาณ</h3>
                  <p className="text-gray-600">
                    {new Date(orderData.estimatedDeliveryTime).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Tracker */}
        <div className="mb-6">
          <OrderTracker order={orderData} />
        </div>

        {/* Restaurant Info */}
        {restaurant && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ข้อมูลร้านอาหาร</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {restaurant.imageUrl ? (
                  <img 
                    src={restaurant.imageUrl} 
                    alt={restaurant.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    🏪
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                  <p className="text-gray-600 text-sm">{restaurant.cuisine}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{parseFloat(restaurant.rating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📞</span>
                      <span>{restaurant.phone || 'ไม่ระบุ'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>รายการอาหาร</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderData.items.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium">เมนู #{item.menuItemId}</div>
                    <div className="text-sm text-gray-600">
                      จำนวน: {item.quantity} x ฿{parseFloat(item.price).toFixed(2)}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        หมายเหตุ: {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">
                    ฿{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>สรุปการสั่งซื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ราคาอาหาร</span>
                <span>
                  ฿{(parseFloat(orderData.totalAmount) - parseFloat(orderData.deliveryFee)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ค่าส่ง</span>
                <span>฿{parseFloat(orderData.deliveryFee).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>รวมทั้งหมด</span>
                <span>฿{parseFloat(orderData.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ที่อยู่จัดส่ง</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{orderData.deliveryAddress}</p>
            {orderData.notes && (
              <div className="mt-3">
                <h4 className="font-semibold mb-1">หมายเหตุ</h4>
                <p className="text-gray-600">{orderData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลการชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span>วิธีการชำระเงิน</span>
              <span className="capitalize">{orderData.paymentMethod === 'cash' ? 'เงินสด' : orderData.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>สถานะการชำระเงิน</span>
              <Badge variant={orderData.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                {orderData.paymentStatus === 'paid' ? 'ชำระแล้ว' : 
                 orderData.paymentStatus === 'pending' ? 'รอชำระ' : 'ชำระไม่สำเร็จ'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
