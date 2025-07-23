import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Truck, Star } from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
  const [searchLocation, setSearchLocation] = useState("กรุงเทพมหานคร, ประเทศไทย");

  const handleSearch = () => {
    // Implement search functionality
    console.log("Searching for:", searchLocation);
  };

  return (
    <section className="bg-gradient-to-r from-primary to-orange-400 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Hero Text */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">ส่งอาหารถึงบ้าน</h1>
          <p className="text-lg opacity-90">Fast delivery from your favorite Thai restaurants</p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Input
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="กรุงเทพมหานคร, ประเทศไทย"
                    className="border-0 outline-none bg-transparent flex-1 placeholder:text-gray-500"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-primary text-white px-6 py-2 hover:bg-orange-600 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                ค้นหา
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>30-45 นาที</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>ฟรีค่าส่ง 500฿+</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>4.8/5 รีวิว</span>
          </div>
        </div>
      </div>
    </section>
  );
}
