import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@shared/schema";
import { Phone, MapPin, Clock } from "lucide-react";

interface OrderTrackerProps {
  order: Order;
  showDetails?: boolean;
}

export default function OrderTracker({ order, showDetails = false }: OrderTrackerProps) {
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

  const orderSteps = [
    { key: 'pending', label: 'สั่งแล้ว' },
    { key: 'confirmed', label: 'ยืนยัน' },
    { key: 'preparing', label: 'กำลังทำ' },
    { key: 'ready', label: 'พร้อมส่ง' },
    { key: 'picked_up', label: 'เก็บแล้ว' },
    { key: 'delivering', label: 'กำลังส่ง' },
    { key: 'delivered', label: 'ส่งแล้ว' },
  ];

  const getCurrentStepIndex = () => {
    if (order.status === 'cancelled') return -1;
    return orderSteps.findIndex(step => step.key === order.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (order.status === 'cancelled') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <div className="text-4xl mb-2">❌</div>
            <h3 className="font-semibold text-destructive mb-2">ออเดอร์ถูกยกเลิก</h3>
            <p className="text-sm text-gray-600">ออเดอร์ #{order.id.slice(0, 8)} ถูกยกเลิกแล้ว</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Order Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">
              ออเดอร์ #{order.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-gray-600">
              ยอดรวม ฿{parseFloat(order.totalAmount).toFixed(2)}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        </div>

        {/* Order Timeline */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {orderSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div className={`w-3 h-3 rounded-full ${
                    isCompleted 
                      ? isCurrent 
                        ? 'bg-primary animate-pulse' 
                        : 'bg-success'
                      : 'bg-gray-300'
                  }`} />
                  
                  {/* Step Label */}
                  <span className={`text-xs mt-1 text-center ${
                    isCompleted 
                      ? isCurrent 
                        ? 'text-primary font-medium' 
                        : 'text-success'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  
                  {/* Connection Line */}
                  {index < orderSteps.length - 1 && (
                    <div className={`absolute top-1.5 w-full h-px ${
                      index < currentStepIndex ? 'bg-success' : 'bg-gray-300'
                    }`} style={{
                      left: '50%',
                      width: `${100 / orderSteps.length}%`,
                      transform: 'translateY(-50%)'
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Info */}
        {showDetails && (
          <div className="space-y-3">
            {/* Delivery Address */}
            <div className="flex items-start space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">ที่อยู่จัดส่ง</p>
                <p className="text-gray-600">{order.deliveryAddress}</p>
              </div>
            </div>

            {/* Estimated Time */}
            {order.estimatedDeliveryTime && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="font-medium">เวลาส่งโดยประมาณ: </span>
                  <span className="text-gray-600">
                    {new Date(order.estimatedDeliveryTime).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="text-sm">
                <p className="font-medium">หมายเหตุ</p>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/order/${order.id}`}
          >
            ดูรายละเอียด
          </Button>
          
          {/* Contact Button - show for active orders */}
          {['confirmed', 'preparing', 'ready', 'picked_up', 'delivering'].includes(order.status) && (
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" />
              ติดต่อ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
