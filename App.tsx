import React, { useState, useEffect } from 'react';
import { ViewState, MenuItem, CartItem, Order, OrderStatus, Restaurant } from './types';
import * as db from './services/mockDb';
import * as gemini from './services/geminiService';
import { MenuCard } from './components/customer/MenuCard';
import { CartDrawer } from './components/customer/CartDrawer';
import { Button } from './components/ui/Button';
import { OrderCard } from './components/admin/OrderCard';
import { 
  ScanLine, 
  ChefHat, 
  ArrowLeft, 
  Minus, 
  Plus, 
  CreditCard, 
  Clock, 
  CheckCircle,
  Sparkles,
  LayoutDashboard,
  UtensilsCrossed,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENTS (Defined here for file constraint, ideally separate) ---

const LandingPage = ({ onStart }: { onStart: (table: number) => void }) => {
  const [table, setTable] = useState('5');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-transparent to-transparent"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm text-center z-10"
      >
        <div className="w-20 h-20 bg-qrave-dark text-white rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-qrave-dark/30 rotate-3">
          <ScanLine size={40} />
        </div>
        <h1 className="font-serif text-5xl text-qrave-dark mb-4 leading-none">Qrave.</h1>
        <p className="font-sans text-stone-500 mb-10 text-lg">The friction-less dining experience.</p>

        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-stone-200/50 mb-8 border border-white">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Table Number</label>
          <input 
            type="number" 
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="w-full text-center text-4xl font-serif font-bold text-qrave-dark border-b-2 border-stone-100 focus:border-qrave-accent focus:outline-none py-2 bg-transparent"
          />
        </div>

        <Button onClick={() => onStart(parseInt(table))} size="lg" variant="secondary" className="w-full">
          View Menu
        </Button>

        <p className="mt-8 text-xs text-stone-400 font-sans">
          Are you a restaurant owner? <br/>
          <span className="underline cursor-pointer hover:text-qrave-dark transition-colors" onClick={() => window.location.hash = '#admin'}>Login to Dashboard</span>
        </p>
      </motion.div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [restaurant, setRestaurant] = useState<Restaurant>(db.getRestaurant());
  
  // Customer State
  const [tableNumber, setTableNumber] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [customerNote, setCustomerNote] = useState('');

  // Admin State
  const [newItemName, setNewItemName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync with Mock DB
  useEffect(() => {
    const handleDbUpdate = () => setRestaurant(db.getRestaurant());
    window.addEventListener('db-update', handleDbUpdate);
    
    // Check hash for direct admin access
    if (window.location.hash === '#admin') {
      setView('ADMIN_DASHBOARD');
    }

    return () => window.removeEventListener('db-update', handleDbUpdate);
  }, []);

  // Polling for Order Status (Customer View)
  useEffect(() => {
    if (activeOrder && (activeOrder.status !== OrderStatus.COMPLETED && activeOrder.status !== OrderStatus.CANCELLED)) {
      const interval = setInterval(() => {
        const freshData = db.getRestaurant();
        const updatedOrder = freshData.orders.find(o => o.id === activeOrder.id);
        if (updatedOrder && updatedOrder.status !== activeOrder.status) {
          setActiveOrder(updatedOrder);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeOrder]);

  // --- Handlers ---

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.id === itemId) {
        if (item.quantity > 1) return [...acc, { ...item, quantity: item.quantity - 1 }];
        return acc;
      }
      return [...acc, item];
    }, [] as CartItem[]));
  };

  const placeOrder = () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      tableNumber,
      items: cart,
      total,
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      customerNote
    };
    
    db.addOrder(newOrder);
    setActiveOrder(newOrder);
    setCart([]);
    setCustomerNote('');
    setView('CUSTOMER_TRACKING');
  };

  const handleAiGenerate = async () => {
    if (!newItemName) return;
    setIsGenerating(true);
    const details = await gemini.generateMenuItemDetails(newItemName);
    if (details) {
      const newItem: MenuItem = {
        id: `menu_${Date.now()}`,
        name: newItemName,
        ...details,
        imageUrl: `https://picsum.photos/seed/${newItemName.replace(/\s/g, '')}/400/300`,
        available: true
      };
      db.addMenuItem(newItem);
      setNewItemName('');
    }
    setIsGenerating(false);
  };

  // --- Render Views ---

  const renderCustomerMenu = () => {
    const categories = db.getMenuByCategory(restaurant.menu);
    return (
      <div className="min-h-screen bg-qrave-base pb-32">
        <header className="sticky top-0 z-40 bg-qrave-base/95 backdrop-blur-md px-6 py-4 border-b border-stone-200/50 flex justify-between items-center transition-all duration-300">
          <div>
            <h1 className="font-serif text-2xl font-bold text-qrave-dark">{restaurant.name}</h1>
            <p className="text-sm font-sans text-stone-500">Table {tableNumber}</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <UtensilsCrossed size={18} className="text-qrave-dark" />
          </div>
        </header>

        <main className="p-4 space-y-8">
          {Object.entries(categories).map(([category, items]) => (
            <section key={category}>
              <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 ml-1">{category}</h2>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <MenuCard key={item.id} item={item} index={idx} onAdd={addToCart} />
                ))}
              </div>
            </section>
          ))}
        </main>
        
        <CartDrawer items={cart} onCheckout={() => setView('CUSTOMER_CHECKOUT')} />
      </div>
    );
  };

  const renderCheckout = () => {
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="px-6 py-4 border-b border-stone-100 flex items-center gap-4">
          <button onClick={() => setView('CUSTOMER_MENU')} className="p-2 hover:bg-stone-50 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-serif text-2xl font-bold">Checkout</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="bg-stone-50 rounded-2xl p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-serif text-lg leading-none mb-1">{item.name}</p>
                    <p className="font-sans text-sm text-stone-400">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-full px-2 py-1 shadow-sm">
                    <button onClick={() => removeFromCart(item.id)} className="p-1"><Minus size={14}/></button>
                    <span className="font-sans font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="p-1"><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Special Requests</label>
              <textarea 
                className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-qrave-accent resize-none text-sm"
                rows={3}
                placeholder="Allergic to peanuts? Extra spicy?"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
              />
            </div>

            <div className="border-t border-dashed border-stone-200 pt-4 space-y-2">
              <div className="flex justify-between text-stone-500 font-sans">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500 font-sans">
                <span>Taxes (10%)</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-serif font-bold text-qrave-dark pt-2">
                <span>Total</span>
                <span>${(total * 1.1).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </main>

        <div className="p-6 border-t border-stone-100">
          <Button onClick={placeOrder} size="lg" className="w-full flex items-center justify-between group">
            <span>Pay with Razorpay</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white/80">${(total * 1.1).toFixed(2)}</span>
              <CreditCard size={20} className="group-hover:translate-x-1 transition-transform"/>
            </div>
          </Button>
        </div>
      </div>
    );
  };

  const renderTracking = () => {
    if (!activeOrder) return null;
    
    const steps = [
      { status: OrderStatus.PENDING, label: "Order Sent", icon: Clock },
      { status: OrderStatus.PREPARING, label: "Kitchen Preparing", icon: ChefHat },
      { status: OrderStatus.READY, label: "Ready to Serve", icon: CheckCircle },
    ];

    const currentIdx = steps.findIndex(s => s.status === activeOrder.status);
    const isCompleted = activeOrder.status === OrderStatus.COMPLETED;

    return (
      <div className="min-h-screen bg-qrave-dark text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600 blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl mb-2">Order #{activeOrder.id.slice(-4)}</h2>
            <p className="text-stone-400 font-sans">Table {tableNumber}</p>
          </div>

          <div className="space-y-8 relative pl-8 border-l-2 border-stone-800 ml-4">
            {steps.map((step, idx) => {
              const isActive = activeOrder.status === step.status;
              const isPast = steps.findIndex(s => s.status === activeOrder.status) > idx || isCompleted;
              const Icon = step.icon;
              
              return (
                <div key={idx} className={`relative transition-all duration-500 ${isActive || isPast ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-qrave-dark ${isActive || isPast ? 'bg-orange-500' : 'bg-stone-800'}`} />
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-stone-800 text-stone-400'}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl">{step.label}</h3>
                      {isActive && <p className="text-sm text-orange-400 animate-pulse">In progress...</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            {isCompleted ? (
              <div className="bg-green-500/20 text-green-400 p-4 rounded-xl border border-green-500/50">
                <p className="font-medium">Order Completed. Enjoy your meal!</p>
                <Button variant="ghost" className="mt-4 text-white hover:text-white hover:bg-white/10" onClick={() => { setActiveOrder(null); setView('CUSTOMER_MENU'); }}>Order More</Button>
              </div>
            ) : (
               <p className="text-stone-500 text-sm italic">Keep this screen open to track your order.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAdmin = () => {
    // Sort orders: Pending first, then active, then completed
    const sortedOrders = [...restaurant.orders].sort((a, b) => {
       const statusWeight = { [OrderStatus.PENDING]: 0, [OrderStatus.PREPARING]: 1, [OrderStatus.READY]: 2, [OrderStatus.COMPLETED]: 3, [OrderStatus.CANCELLED]: 4 };
       return statusWeight[a.status] - statusWeight[b.status] || b.timestamp - a.timestamp;
    });

    return (
      <div className="min-h-screen bg-stone-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-qrave-dark text-white p-6 hidden md:flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <ChefHat size={18} />
              </div>
              <h1 className="font-serif text-xl font-bold">Qrave Admin</h1>
            </div>
            <nav className="space-y-2">
              <button 
                onClick={() => setView('ADMIN_DASHBOARD')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'ADMIN_DASHBOARD' ? 'bg-white/10 text-white' : 'text-stone-400 hover:text-white'}`}
              >
                <LayoutDashboard size={20} />
                <span className="font-sans text-sm font-medium">Live Orders</span>
              </button>
              <button 
                onClick={() => setView('ADMIN_MENU')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'ADMIN_MENU' ? 'bg-white/10 text-white' : 'text-stone-400 hover:text-white'}`}
              >
                <UtensilsCrossed size={20} />
                <span className="font-sans text-sm font-medium">Menu Manager</span>
              </button>
            </nav>
          </div>
          <button 
             onClick={() => { setView('LANDING'); window.location.hash = ''; }}
             className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:text-white transition-colors"
          >
             <LogOut size={18} />
             <span className="text-sm">Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <header className="bg-white border-b border-stone-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30">
             <h2 className="font-serif text-2xl font-bold text-qrave-dark">
               {view === 'ADMIN_DASHBOARD' ? 'Kitchen Display System' : 'Menu Management'}
             </h2>
             <div className="flex items-center gap-4">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-sm font-medium text-stone-500">System Operational</span>
             </div>
          </header>

          <div className="p-8">
            {view === 'ADMIN_DASHBOARD' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {sortedOrders.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-stone-400">
                      <Clock size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No active orders</p>
                    </div>
                 ) : (
                    sortedOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onStatusChange={db.updateOrderStatus} 
                      />
                    ))
                 )}
               </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
                  <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={20} />
                    AI Menu Generator
                  </h3>
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      placeholder="e.g. Lobster Thermidor"
                      className="flex-1 bg-stone-50 border-stone-200 rounded-xl px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                    <Button 
                      onClick={handleAiGenerate} 
                      disabled={!newItemName} 
                      isLoading={isGenerating}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Auto-Create
                    </Button>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">
                    Powered by Gemini 2.5 Flash. Generates description, price, category, and image automatically.
                  </p>
                </div>

                <div className="space-y-4">
                  {restaurant.menu.slice().reverse().map(item => (
                    <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-stone-200 items-center">
                       <img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-stone-100" />
                       <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-bold font-serif text-lg">{item.name}</h4>
                            <span className="font-mono text-stone-500">${item.price}</span>
                          </div>
                          <p className="text-sm text-stone-500 line-clamp-1">{item.description}</p>
                          <div className="flex gap-2 mt-2">
                             <span className="text-[10px] uppercase font-bold tracking-wider bg-stone-100 px-2 py-0.5 rounded text-stone-500">{item.category}</span>
                             {item.isVegetarian && <span className="text-[10px] uppercase font-bold tracking-wider bg-green-100 px-2 py-0.5 rounded text-green-700">Veg</span>}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="font-sans antialiased text-qrave-dark">
      {view === 'LANDING' && <LandingPage onStart={(n) => { setTableNumber(n); setView('CUSTOMER_MENU'); }} />}
      {view === 'CUSTOMER_MENU' && renderCustomerMenu()}
      {view === 'CUSTOMER_CHECKOUT' && renderCheckout()}
      {view === 'CUSTOMER_TRACKING' && renderTracking()}
      {(view === 'ADMIN_DASHBOARD' || view === 'ADMIN_MENU') && renderAdmin()}
    </div>
  );
};

export default App;
