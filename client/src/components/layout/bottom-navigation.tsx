import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Search, ShoppingCart, Clock, User } from "lucide-react";
import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: 'หน้าแรก', path: '/' },
    { icon: Search, label: 'ค้นหา', path: '/search' },
    { icon: ShoppingCart, label: 'ตะกร้า', path: '/cart', badge: 2 },
    { icon: Clock, label: 'ประวัติ', path: '/history' },
    { icon: User, label: 'บัญชี', path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location === '/' || location === '/home';
    }
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`flex flex-col items-center py-2 px-3 h-auto space-y-1 ${
                active 
                  ? 'text-primary' 
                  : 'text-gray-400 hover:text-primary'
              }`}
              onClick={() => window.location.href = item.path}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-destructive text-white text-xs h-4 w-4 flex items-center justify-center p-0">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
