import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './src/context/CartContext';
import { Landing } from './src/pages/Landing';
import { CustomerMenu } from './src/pages/CustomerMenu';
import { CustomerCheckout } from './src/pages/CustomerCheckout';
import { CustomerTracking } from './src/pages/CustomerTracking';
import { AdminDashboard } from './src/pages/AdminDashboard';
import { Invoice } from './src/pages/Invoice';

const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/r/:slug" element={<CustomerMenu />} />
          <Route path="/r/:slug/checkout" element={<CustomerCheckout />} />
          <Route path="/r/:slug/orders/:orderId" element={<CustomerTracking />} />
          <Route path="/r/:slug/orders/:orderId/invoice" element={<Invoice />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
