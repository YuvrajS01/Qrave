import { MenuItem, Order, OrderStatus, Restaurant } from '../types';

// Initial Mock Data
const INITIAL_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Truffle Mushroom Risotto',
    description: 'Arborio rice slowly cooked with porcini broth, finished with truffle oil and aged parmesan.',
    price: 24,
    category: 'Mains',
    imageUrl: 'https://picsum.photos/seed/risotto/400/300',
    isVegetarian: true,
    available: true,
  },
  {
    id: '2',
    name: 'Crispy Pork Belly',
    description: 'Slow-roasted pork belly with a crackling skin, served on a bed of apple fennel slaw.',
    price: 28,
    category: 'Mains',
    imageUrl: 'https://picsum.photos/seed/pork/400/300',
    available: true,
  },
  {
    id: '3',
    name: 'Burrata & Heirloom',
    description: 'Fresh burrata cheese with heirloom tomatoes, basil pesto, and balsamic glaze.',
    price: 18,
    category: 'Starters',
    imageUrl: 'https://picsum.photos/seed/burrata/400/300',
    isVegetarian: true,
    available: true,
  },
  {
    id: '4',
    name: 'Yuzu Cheese Tart',
    description: 'Zesty yuzu curd in a buttery pastry shell, topped with toasted meringue.',
    price: 12,
    category: 'Desserts',
    imageUrl: 'https://picsum.photos/seed/tart/400/300',
    isVegetarian: true,
    available: true,
  },
  {
    id: '5',
    name: 'Wagyu Beef Sliders',
    description: 'Two premium wagyu patties, brioche bun, caramelized onions, and secret sauce.',
    price: 22,
    category: 'Starters',
    imageUrl: 'https://picsum.photos/seed/sliders/400/300',
    available: true,
  }
];

const INITIAL_RESTAURANT: Restaurant = {
  id: 'rest_01',
  name: 'The Obsidian Fork',
  menu: INITIAL_MENU,
  orders: [],
  tables: 12
};

// Simulate local storage persistence
const STORAGE_KEY = 'qrave_db_v1';

export const getRestaurant = (): Restaurant => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  saveRestaurant(INITIAL_RESTAURANT);
  return INITIAL_RESTAURANT;
};

export const saveRestaurant = (data: Restaurant) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Dispatch event for cross-component updates
  window.dispatchEvent(new Event('db-update'));
};

export const addOrder = (order: Order) => {
  const data = getRestaurant();
  data.orders.unshift(order); // Add to top
  saveRestaurant(data);
};

export const updateOrderStatus = (orderId: string, status: OrderStatus) => {
  const data = getRestaurant();
  const order = data.orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    saveRestaurant(data);
  }
};

export const addMenuItem = (item: MenuItem) => {
  const data = getRestaurant();
  data.menu.push(item);
  saveRestaurant(data);
};

// Helper to categorize menu
export const getMenuByCategory = (menu: MenuItem[]) => {
  return menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
};

export const getRestaurantBySlug = (slug: string): Restaurant | undefined => {
  // For MVP, we only have one restaurant, so we ignore the slug but in real app we'd fetch by slug
  // We'll just return the default restaurant if the slug matches our "demo" slug or just return it anyway for now
  return getRestaurant();
};

export const getOrderByToken = (token: string): Order | undefined => {
  const data = getRestaurant();
  return data.orders.find(o => o.id === token);
};
