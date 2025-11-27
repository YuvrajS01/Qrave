export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  available: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: number;
  customerNote?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  menu: MenuItem[];
  orders: Order[];
  tables: number;
}

export type ViewState = 
  | 'LANDING' 
  | 'CUSTOMER_MENU' 
  | 'CUSTOMER_CHECKOUT' 
  | 'CUSTOMER_TRACKING' 
  | 'ADMIN_DASHBOARD'
  | 'ADMIN_MENU';
