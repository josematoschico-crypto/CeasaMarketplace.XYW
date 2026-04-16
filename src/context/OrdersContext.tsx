import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Order } from '../types/index';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from './AuthContext';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateOrderFeedback: (orderId: string, feedback: Order['qualityFeedback']) => Promise<void>;
  updateLogisticsStatus: (orderId: string, status: Order['logistics']['status']) => Promise<void>;
  getOrdersByStall: (stallId: string) => Order[];
  getOrdersByBuyer: (buyerId: string) => Order[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user || !auth.currentUser) {
      // For mock users or unauthenticated users, we don't subscribe to Firestore
      // But we should clear orders if not authenticated
      if (!isAuthenticated) {
        setOrders([]);
      }
      return;
    }

    let q;
    const isAdmin = user.email === 'josematos.chico@gmail.com';

    if (isAdmin) {
      q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    } else if (user.role === 'seller') {
      q = query(
        collection(db, 'orders'), 
        where('sellerId', '==', user.id),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        collection(db, 'orders'), 
        where('buyerId', '==', user.id),
        orderBy('date', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    }, (error) => {
      // If it's a permission error, it might be because of missing index for the filtered query
      handleFirestoreError(error, OperationType.GET, 'orders');
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const addOrder = async (order: Order) => {
    try {
      setOrders(prev => [order, ...prev]);
      if (auth.currentUser) {
        await setDoc(doc(db, 'orders', order.id), order);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (auth.currentUser) {
        await updateDoc(doc(db, 'orders', orderId), { status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  const updateOrderFeedback = async (orderId: string, feedback: Order['qualityFeedback']) => {
    try {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, qualityFeedback: feedback } : o));
      if (auth.currentUser) {
        await updateDoc(doc(db, 'orders', orderId), { qualityFeedback: feedback });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  const updateLogisticsStatus = async (orderId: string, status: Order['logistics']['status']) => {
    try {
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const updatedLogistics = o.logistics ? { ...o.logistics, status } : undefined;
          // If delivered, also update order status
          const orderStatus = status === 'DELIVERED' ? 'delivered' : o.status;
          return { ...o, status: orderStatus, logistics: updatedLogistics };
        }
        return o;
      }));

      if (auth.currentUser) {
        const updates: any = { 'logistics.status': status };
        if (status === 'DELIVERED') updates.status = 'delivered';
        await updateDoc(doc(db, 'orders', orderId), updates);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  const getOrdersByStall = (stallId: string) => {
    return orders.filter(o => o.stallId === stallId);
  };

  const getOrdersByBuyer = (buyerId: string) => {
    return orders.filter(o => o.buyerId === buyerId);
  };

  useEffect(() => {
    // Simulate Lalamove status updates for active orders
    const activeOrders = orders.filter(o => o.logistics && o.logistics.status !== 'DELIVERED' && o.logistics.status !== 'CANCELLED');
    
    if (activeOrders.length > 0) {
      const timer = setTimeout(() => {
        activeOrders.forEach(order => {
          let nextStatus: Order['logistics']['status'] | null = null;
          switch (order.logistics!.status) {
            case 'ASSIGNING_DRIVER': nextStatus = 'PICKED_UP'; break;
            case 'PICKED_UP': nextStatus = 'ON_THE_WAY'; break;
            case 'ON_THE_WAY': nextStatus = 'DELIVERED'; break;
          }
          if (nextStatus) {
            updateLogisticsStatus(order.id, nextStatus);
          }
        });
      }, 10000); // Update every 10 seconds for demo
      return () => clearTimeout(timer);
    }
  }, [orders]);

  return (
    <OrdersContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus,
      updateOrderFeedback,
      updateLogisticsStatus,
      getOrdersByStall,
      getOrdersByBuyer
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
