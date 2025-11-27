import React from 'react';
import { Order, OrderStatus } from '../../src/types';
import { Clock, CheckCircle2, ChefHat, XCircle } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange }) => {
  const statusColors = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [OrderStatus.PREPARING]: 'bg-blue-100 text-blue-800 border-blue-200',
    [OrderStatus.READY]: 'bg-green-100 text-green-800 border-green-200',
    [OrderStatus.COMPLETED]: 'bg-stone-100 text-stone-500 border-stone-200',
    [OrderStatus.CANCELLED]: 'bg-red-50 text-red-800 border-red-100',
  };

  const nextStatusMap: Record<string, OrderStatus> = {
    [OrderStatus.PENDING]: OrderStatus.PREPARING,
    [OrderStatus.PREPARING]: OrderStatus.READY,
    [OrderStatus.READY]: OrderStatus.COMPLETED,
  };

  const getNextActionLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'Accept & Cook';
      case OrderStatus.PREPARING: return 'Mark Ready';
      case OrderStatus.READY: return 'Complete';
      default: return null;
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-serif text-xl font-semibold text-qrave-dark">Table {order.tableNumber}</h4>
          <span className="text-xs text-stone-400 font-sans">
            #{order.id.slice(-4)} • {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-2 border-t border-b border-stone-100 py-3 my-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm font-sans">
            <span className="text-stone-700"><span className="font-bold text-qrave-dark">{item.quantity}x</span> {item.name}</span>
            <span className="text-stone-400 font-mono">₹{(item.price * item.quantity).toFixed(0)}</span>
          </div>
        ))}
      </div>

      {order.customerNote && (
        <div className="bg-orange-50 p-2 rounded text-xs text-orange-800 font-sans italic">
          " {order.customerNote} "
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
        <span className="text-stone-500 text-sm font-medium">Total Amount</span>
        <span className="font-sans font-bold text-lg">₹{order.total.toFixed(2)}</span>
      </div>

      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
            <>
              <button
                onClick={() => onStatusChange(order.id, OrderStatus.CANCELLED)}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancel Order"
              >
                <XCircle size={20} />
              </button>

              {nextStatusMap[order.status] && (
                <button
                  onClick={() => onStatusChange(order.id, nextStatusMap[order.status])}
                  className="flex items-center gap-2 px-4 py-2 bg-qrave-dark text-white rounded-lg hover:bg-black font-sans text-sm font-medium transition-colors"
                >
                  {order.status === OrderStatus.PENDING && <ChefHat size={16} />}
                  {order.status === OrderStatus.PREPARING && <CheckCircle2 size={16} />}
                  {order.status === OrderStatus.READY && <CheckCircle2 size={16} />}
                  {getNextActionLabel(order.status)}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
