import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 opacity-90"></div>
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">🍜 FoodFlow</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-2">ส่งอาหารถึงบ้าน</p>
            <p className="text-lg opacity-80">Fast delivery from your favorite Thai restaurants</p>
          </div>
          
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            เริ่มใช้งาน
          </Button>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <h3 className="font-semibold mb-1">ส่งเร็ว</h3>
              <p className="text-sm opacity-80">30-45 นาที</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚚</div>
              <h3 className="font-semibold mb-1">ส่งฟรี</h3>
              <p className="text-sm opacity-80">สั่ง 500฿ ขึ้นไป</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-semibold mb-1">คุณภาพ</h3>
              <p className="text-sm opacity-80">4.8/5 รีวิว</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">ทำไมต้องเลือก FoodFlow?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            แพลตฟอร์มส่งอาหารที่ออกแบบมาเพื่อคนไทยโดยเฉพาะ พร้อมระบบที่ครบครันสำหรับทุกกลุ่มผู้ใช้
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="font-semibold mb-2">สำหรับลูกค้า</h3>
              <p className="text-sm text-gray-600">สั่งอาหารง่าย ติดตามสถานะ</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="font-semibold mb-2">สำหรับร้านอาหาร</h3>
              <p className="text-sm text-gray-600">จัดการเมนู รับออเดอร์</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏍️</span>
              </div>
              <h3 className="font-semibold mb-2">สำหรับไรเดอร์</h3>
              <p className="text-sm text-gray-600">รับงานส่ง อัปเดตสถานะ</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="font-semibold mb-2">สำหรับแอดมิน</h3>
              <p className="text-sm text-gray-600">จัดการระบบ ดูรายงาน</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">พร้อมเริ่มต้นแล้วหรือยัง?</h3>
          <p className="text-gray-600 mb-6">เข้าร่วมกับเราวันนี้และสัมผัสประสบการณ์ส่งอาหารรูปแบบใหม่</p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            ลงทะเบียนฟรี
          </Button>
        </div>
      </div>
    </div>
  );
}
