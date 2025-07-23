import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TopNavigation from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Delivery, Order } from "@shared/schema";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function DriverDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'driver')) {
      toast({
        title: "Unauthorized",
        description: "You need to be a driver to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isLoading, toast]);

  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
    enabled: !!user && user.role === 'driver',
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user && user.role === 'driver',
  });

  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ deliveryId, status }: { deliveryId: number; status: string }) => {
      await apiRequest("PUT", `/api/deliveries/${deliveryId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({ title: "สำเร็จ", description: "อัปเดตสถานะการส่งเรียบร้อยแล้ว" });
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

  const getStatusColor = (status: string) => {
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
  };

  const getStatusText = (status: string) => {
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
  };

  if (isLoading || deliveriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const assignedOrders = orders.filter(order => order.driverId === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">แดชบอร์ดไรเดอร์</h1>
          <p className="text-gray-600">จัดการการส่งของและอัปเดตสถานะ</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">📦</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{assignedOrders.length}</p>
                  <p className="text-sm text-gray-600">งานที่รับ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <span className="text-warning font-bold">🏍️</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {deliveries.filter(delivery => delivery.status === 'en_route').length}
                  </p>
                  <p className="text-sm text-gray-600">กำลังส่ง</p>
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
                    {deliveries.filter(delivery => delivery.status === 'delivered').length}
                  </p>
                  <p className="text-sm text-gray-600">ส่งสำเร็จ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <span className="text-destructive font-bold">❌</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {deliveries.filter(delivery => delivery.status === 'failed').length}
                  </p>
                  <p className="text-sm text-gray-600">ไม่สำเร็จ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle>งานส่งที่กำลังดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveries.filter(delivery => ['assigned', 'picked_up', 'en_route'].includes(delivery.status)).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏍️</div>
                  <h3 className="text-lg font-semibold mb-2">ไม่มีงานส่งในขณะนี้</h3>
                  <p className="text-gray-600">รออัปเดตงานใหม่</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries
                    .filter(delivery => ['assigned', 'picked_up', 'en_route'].includes(delivery.status))
                    .map((delivery) => (
                      <div key={delivery.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">งาน #{delivery.id}</h3>
                          <Badge className={getStatusColor(delivery.status)}>
                            {getStatusText(delivery.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <p>ออเดอร์: #{delivery.orderId.slice(0, 8)}</p>
                          <p>เวลา: {new Date(delivery.createdAt).toLocaleTimeString('th-TH')}</p>
                        </div>

                        <div className="flex space-x-2">
                          {delivery.status === 'assigned' && (
                            <Button
                              size="sm"
                              onClick={() => updateDeliveryMutation.mutate({ 
                                deliveryId: delivery.id, 
                                status: 'picked_up' 
                              })}
                              disabled={updateDeliveryMutation.isPending}
                            >
                              เก็บของแล้ว
                            </Button>
                          )}
                          
                          {delivery.status === 'picked_up' && (
                            <Button
                              size="sm"
                              onClick={() => updateDeliveryMutation.mutate({ 
                                deliveryId: delivery.id, 
                                status: 'en_route' 
                              })}
                              disabled={updateDeliveryMutation.isPending}
                            >
                              เริ่มส่ง
                            </Button>
                          )}
                          
                          {delivery.status === 'en_route' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => updateDeliveryMutation.mutate({ 
                                  deliveryId: delivery.id, 
                                  status: 'delivered' 
                                })}
                                disabled={updateDeliveryMutation.isPending}
                              >
                                ส่งสำเร็จ
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateDeliveryMutation.mutate({ 
                                  deliveryId: delivery.id, 
                                  status: 'failed' 
                                })}
                                disabled={updateDeliveryMutation.isPending}
                              >
                                ส่งไม่สำเร็จ
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery History */}
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการส่งล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-600">ยังไม่มีประวัติการส่ง</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {deliveries
                    .filter(delivery => ['delivered', 'failed'].includes(delivery.status))
                    .slice(0, 10)
                    .map((delivery) => (
                      <div key={delivery.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">งาน #{delivery.id}</span>
                          <Badge className={getStatusColor(delivery.status)}>
                            {getStatusText(delivery.status)}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p>ออเดอร์: #{delivery.orderId.slice(0, 8)}</p>
                          <p>
                            เสร็จสิ้น: {delivery.deliveryTime ? 
                              new Date(delivery.deliveryTime).toLocaleString('th-TH') : 
                              'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
