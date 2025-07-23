export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

export interface OrderWithItems {
  id: string;
  customerId: string;
  restaurantId: number;
  driverId?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
  totalAmount: string;
  deliveryFee: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    menuItemId: number;
    quantity: number;
    price: string;
    notes?: string;
  }>;
}

export interface RestaurantWithMenu {
  id: number;
  name: string;
  description?: string;
  cuisine?: string;
  imageUrl?: string;
  address: string;
  phone?: string;
  rating: string;
  deliveryTime: string;
  deliveryFee: string;
  minimumOrder: string;
  isOpen: boolean;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  menuItems?: Array<{
    id: number;
    name: string;
    description?: string;
    price: string;
    imageUrl?: string;
    category?: string;
    isAvailable: boolean;
  }>;
}
