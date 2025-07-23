import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const roleButtons = [
  { role: 'customer', label: 'ลูกค้า', href: '/customer' },
  { role: 'vendor', label: 'ร้านอาหาร', href: '/vendor' },
  { role: 'driver', label: 'ไรเดอร์', href: '/driver' },
  { role: 'admin', label: 'แอดมิน', href: '/admin' },
];

export default function TopNavigation() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email;
    return 'ผู้ใช้';
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      customer: 'ลูกค้า',
      vendor: 'ร้านอาหาร',
      driver: 'ไรเดอร์',
      admin: 'แอดมิน',
    };
    return roleMap[role] || role;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              className="text-2xl font-bold text-primary hover:bg-transparent p-0"
              onClick={() => window.location.href = '/'}
            >
              🍜 FoodFlow
            </Button>
            <div className="hidden md:block text-sm text-gray-600">Thailand</div>
          </div>
          
          {/* Desktop Role Switcher */}
          {user && !isMobile && (
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              {roleButtons.map((roleBtn) => (
                <Button
                  key={roleBtn.role}
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1 rounded text-sm ${
                    user.role === roleBtn.role
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => window.location.href = roleBtn.href}
                >
                  {roleBtn.label}
                </Button>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-primary">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 bg-destructive text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                    3
                  </Badge>
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-auto p-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {user.firstName ? user.firstName.charAt(0) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm text-gray-700">
                        {getUserDisplayName()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {/* Mobile Role Switcher */}
                    {isMobile && (
                      <>
                        <div className="px-2 py-1">
                          <p className="text-xs font-medium text-gray-500 mb-2">เปลี่ยนบทบาท</p>
                          {roleButtons.map((roleBtn) => (
                            <DropdownMenuItem 
                              key={roleBtn.role}
                              onClick={() => window.location.href = roleBtn.href}
                              className={user.role === roleBtn.role ? 'bg-primary/10' : ''}
                            >
                              {roleBtn.label}
                              {user.role === roleBtn.role && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  ปัจจุบัน
                                </Badge>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                      <User className="mr-2 h-4 w-4" />
                      โปรไฟล์
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                      <Settings className="mr-2 h-4 w-4" />
                      ตั้งค่า
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/api/logout'}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => window.location.href = '/api/login'}>
                เข้าสู่ระบบ
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
