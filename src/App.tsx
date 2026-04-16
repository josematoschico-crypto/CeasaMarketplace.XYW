import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, Home as HomeIcon, Search, User, Package, Menu, ChevronRight, Truck, Store as StoreIcon, ShoppingBag, Activity, Zap, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import StallsPage from './pages/StallsPage';
import StallDetailPage from './pages/StallDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerRegistrationPage from './pages/SellerRegistrationPage';
import BuyerRegistrationPage from './pages/BuyerRegistrationPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';
import DailyPricesPage from './pages/DailyPricesPage';

// Context/State (Simplified for demo)
import { CartItem } from './types';

import { StallsProvider } from './context/StallsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrdersProvider, useOrders } from './context/OrdersContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import RegistrationModal from './components/RegistrationModal';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StallsProvider>
          <OrdersProvider>
            <MarketApp />
          </OrdersProvider>
        </StallsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function MarketApp() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const { orders, addOrder: addOrderToContext } = useOrders();

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setCart([]);
    }
  }, [isAuthenticated]);
  
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  
  const addToCart = (item: CartItem) => {
    if (!isAuthenticated) {
      setIsRegistrationModalOpen(true);
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const clearCart = () => setCart([]);

  const addOrder = (newOrder: any) => {
    addOrderToContext(newOrder);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Header 
          cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
          ordersCount={activeOrdersCount}
        />
        
        <main className="container mx-auto px-4 pb-24 md:pb-8 pt-20 max-w-7xl">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<ProductsPage addToCart={addToCart} />} />
              <Route path="/precos-do-dia" element={<DailyPricesPage addToCart={addToCart} />} />
              <Route path="/produtos/:id" element={<ProductDetailPage addToCart={addToCart} />} />
              <Route path="/barracas" element={<StallsPage />} />
              <Route path="/barracas/:id" element={<StallDetailPage addToCart={addToCart} />} />
              
              {isAuthenticated && user?.role === 'buyer' && (
                <>
                  <Route path="/carrinho" element={<CartPage cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} />
                  <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} addOrder={addOrder} />} />
                  <Route path="/pedidos" element={<OrdersPage />} />
                </>
              )}

              <Route path="/painel-vendedor" element={<SellerDashboardPage />} />
              <Route path="/painel-vendedor/:id" element={<SellerDashboardPage />} />
              <Route path="/cadastro-vendedor" element={<SellerRegistrationPage />} />
              <Route path="/cadastro-comprador" element={<BuyerRegistrationPage />} />
              <Route path="/painel-comprador" element={<BuyerDashboardPage />} />
            </Routes>
          </AnimatePresence>
        </main>

        <div className="md:hidden">
          <MobileNav 
            cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
            ordersCount={activeOrdersCount} 
          />
        </div>
        <RegistrationModal 
          isOpen={isRegistrationModalOpen} 
          onClose={() => setIsRegistrationModalOpen(false)} 
        />
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

function Header({ cartCount, ordersCount }: { cartCount: number, ordersCount: number }) {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSwitchRole = async () => {
    if (!user) return;
    const newRole = user.role === 'seller' ? 'buyer' : 'seller';
    try {
      await updateUser(user.id, { role: newRole });
      toast.success(`Perfil alterado para ${newRole === 'seller' ? 'Produtor' : 'Comprador'}`);
      navigate(newRole === 'seller' ? `/painel-vendedor/${user.barracaId}` : "/painel-comprador");
    } catch (error) {
      toast.error("Erro ao trocar de perfil.");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-green-600 p-1.5 rounded-lg">
            <Package className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-green-600">CEASA <span className="text-slate-400 font-light">Market</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium hover:text-green-600 transition-colors">Início</Link>
          <Link to="/produtos" className="text-sm font-medium hover:text-green-600 transition-colors">Produtos</Link>
          <Link to="/barracas" className="text-sm font-medium hover:text-green-600 transition-colors">Barracas</Link>
          <Link to={isAuthenticated ? `/painel-vendedor/${user?.barracaId}` : "/painel-vendedor"} className="text-sm font-medium hover:text-green-600 transition-colors flex items-center gap-1">
            <StoreIcon className="w-4 h-4" /> Vender
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isAuthenticated && user?.role === 'buyer' && (
              <motion.div 
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className="flex items-center gap-1"
              >
                <Link 
                  to="/pedidos" 
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all group border shadow-sm ${
                    ordersCount > 0 
                      ? 'bg-orange-50/50 hover:bg-orange-100/80 border-orange-100/50 shadow-orange-900/5' 
                      : 'bg-green-50/50 hover:bg-green-100/80 border-green-100/50 shadow-green-900/5'
                  }`}
                >
                  <Truck className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                    ordersCount > 0 ? 'text-orange-600' : 'text-green-600'
                  }`} />
                  <span className={`text-sm font-bold hidden lg:inline ${
                    ordersCount > 0 ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    Meus Pedidos
                  </span>
                  {ordersCount > 0 && (
                    <Badge className="px-1.5 min-w-[1.25rem] h-5 bg-orange-600 text-white border-none text-[10px] flex items-center justify-center shadow-sm">
                      {ordersCount}
                    </Badge>
                  )}
                </Link>
                <Link to="/carrinho" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50/50 hover:bg-green-100/80 transition-all group border border-green-100/50 shadow-sm shadow-green-900/5">
                  <ShoppingCart className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-green-700 hidden lg:inline">Meu Carrinho</span>
                  {cartCount > 0 && (
                    <Badge className="px-1.5 min-w-[1.25rem] h-5 bg-green-600 text-white border-none text-[10px] flex items-center justify-center shadow-sm">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-10">
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold text-[#001F3F] px-2 mb-2">Navegação</h2>
                  <SheetClose nativeButton={false} render={<Link to="/" className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-slate-50 transition-colors" />}>
                    <HomeIcon className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-lg">Início</span>
                  </SheetClose>
                  <SheetClose nativeButton={false} render={<Link to="/produtos" className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-slate-50 transition-colors" />}>
                    <Search className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-lg">Produtos</span>
                  </SheetClose>
                  <SheetClose nativeButton={false} render={<Link to="/barracas" className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-slate-50 transition-colors" />}>
                    <StoreIcon className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-lg">Barracas</span>
                  </SheetClose>
                  <SheetClose nativeButton={false} render={<Link to={isAuthenticated ? `/painel-vendedor/${user?.barracaId}` : "/painel-vendedor"} className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-slate-50 transition-colors" />}>
                    <Store className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-lg">Vender no CEASA</span>
                  </SheetClose>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t border-slate-100">
                  <h2 className="text-2xl font-bold text-[#001F3F] px-2 mb-2">Minha Conta</h2>
                  {isAuthenticated ? (
                    <>
                      <SheetClose nativeButton={false} render={<Link to={user?.role === 'seller' ? `/painel-vendedor/${user?.barracaId}` : "/painel-comprador"} className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-slate-50 hover:bg-green-50 transition-all border border-slate-100 hover:border-green-100 group" />}>
                        <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="font-bold text-lg text-slate-900">{user?.role === 'seller' ? 'Painel Produtor' : 'Meu Painel'}</span>
                      </SheetClose>
                      
                      <SheetClose nativeButton={true} render={<Button variant="ghost" className="justify-start gap-4 px-4 py-4 h-auto rounded-2xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all border border-transparent hover:border-red-100 group" onClick={() => { logout(); navigate('/'); }} />}>
                        <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                          <LogOut className="w-6 h-6 text-slate-400 group-hover:text-red-500" />
                        </div>
                        <span className="font-bold text-lg">Sair</span>
                      </SheetClose>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <SheetClose nativeButton={false} render={<Link to="/painel-vendedor" className="flex items-center gap-4 px-4 py-5 rounded-3xl bg-slate-50 hover:bg-green-50 transition-all border border-slate-100 hover:border-green-200 group shadow-sm" />}>
                        <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                          <Store className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-xl text-slate-900 leading-tight">Vendedor</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acesse sua Barraca</span>
                        </div>
                      </SheetClose>

                      <SheetClose nativeButton={false} render={<Link to="/painel-comprador" className="flex items-center gap-4 px-4 py-5 rounded-3xl bg-slate-50 hover:bg-blue-50 transition-all border border-slate-100 hover:border-blue-200 group shadow-sm" />}>
                        <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                          <ShoppingBag className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-xl text-slate-900 leading-tight">Comprador</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acesse seus Pedidos</span>
                        </div>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer">
              <User className="w-4 h-4" />
              {isAuthenticated ? (user?.role === 'seller' ? 'Painel Produtor' : 'Meu Painel') : 'Entrar'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100 bg-white">
              <div className="font-black text-slate-900 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                {isAuthenticated ? 'Minha Conta' : 'Entrar como'}
              </div>
              <DropdownMenuSeparator className="bg-slate-100" />
              
              {!isAuthenticated ? (
                <>
                  <DropdownMenuItem onClick={() => navigate('/painel-vendedor')} className="rounded-xl p-3 focus:bg-green-50 focus:text-green-700 cursor-pointer">
                    <Store className="w-4 h-4 mr-2" />
                    <span>Vendedor / Produtor</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/painel-comprador')} className="rounded-xl p-3 focus:bg-green-50 focus:text-green-700 cursor-pointer">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    <span>Comprador</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate(user?.role === 'seller' ? `/painel-vendedor/${user?.barracaId}` : "/painel-comprador")} className="rounded-xl p-3 focus:bg-green-50 focus:text-green-700 cursor-pointer">
                    <Activity className="w-4 h-4 mr-2" />
                    <span>{user?.role === 'seller' ? 'Painel Produtor' : 'Meu Painel'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="rounded-xl p-3 focus:bg-red-50 focus:text-red-600 text-slate-500 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ cartCount, ordersCount }: { cartCount: number, ordersCount: number }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const navItems = [
    { icon: HomeIcon, label: 'Início', path: '/' },
    { icon: StoreIcon, label: 'Barracas', path: '/barracas' },
    { 
      icon: isAuthenticated && user?.role === 'seller' ? User : User, 
      label: 'Painel', 
      path: (isAuthenticated && user?.role === 'seller') ? `/painel-vendedor/${user?.barracaId}` : '/painel-comprador'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] overflow-x-auto">
      <div className="max-w-7xl mx-auto flex justify-around items-center h-20 min-w-[320px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-1 bg-green-600"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative mb-1.5">
                <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              </div>
              <span className={`text-[11px] sm:text-[13px] font-semibold tracking-tight ${isActive ? 'text-green-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
