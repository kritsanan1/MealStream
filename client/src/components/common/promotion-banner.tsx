import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PromotionBanner() {
  const promotions = [
    {
      id: 1,
      title: "ลด 50% สำหรับผู้ใช้ใหม่",
      description: "ใช้โค้ด WELCOME50 สำหรับออเดอร์แรก",
      buttonText: "ใช้เลย",
      gradient: "from-red-500 to-pink-600",
      code: "WELCOME50"
    },
    {
      id: 2,
      title: "ฟรีค่าส่ง",
      description: "สำหรับออเดอร์ 300฿ ขึ้นไป",
      buttonText: "สั่งเลย",
      gradient: "from-green-500 to-teal-600",
      code: "FREESHIP300"
    }
  ];

  const handlePromoClick = (code: string) => {
    // Copy promo code to clipboard
    navigator.clipboard.writeText(code).then(() => {
      // Could add a toast notification here
      console.log(`Copied ${code} to clipboard`);
    });
  };

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">โปรโมชั่นพิเศษ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((promo) => (
            <Card 
              key={promo.id}
              className={`overflow-hidden bg-gradient-to-r ${promo.gradient} text-white border-0`}
            >
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">{promo.title}</h3>
                <p className="text-sm opacity-90 mb-3">{promo.description}</p>
                <Button 
                  onClick={() => handlePromoClick(promo.code)}
                  className="bg-white text-gray-800 px-4 py-2 hover:bg-gray-100 text-sm font-medium transition-colors"
                >
                  {promo.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
