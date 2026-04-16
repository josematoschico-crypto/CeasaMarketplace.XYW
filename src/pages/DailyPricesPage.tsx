import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Plus, Minus, Info, ArrowLeft, Clock, Zap } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PRODUCTS } from '../data/mock';
import { CartItem, Product, StallProduct } from '../types';
import { useStalls } from '../context/StallsContext';
import { useAuth } from '../context/AuthContext';

interface DailyPricesPageProps {
  addToCart: (item: CartItem) => void;
}

export default function DailyPricesPage({ addToCart }: DailyPricesPageProps) {
  const { stallProducts, stalls } = useStalls();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Filter products that were updated "today" (for demo, we show all since they are all new)
  const dailyOffers = useMemo(() => {
    return stallProducts.filter(sp => {
      const product = PRODUCTS.find(p => p.id === sp.productId);
      if (!product) return false;
      
      const searchLower = search.toLowerCase();
      const matchesSearch = product.nome_exibicao.toLowerCase().includes(searchLower) || 
                            product.subclassificacao.toLowerCase().includes(searchLower);
      
      return matchesSearch;
    }).map(sp => ({
      ...sp,
      product: PRODUCTS.find(p => p.id === sp.productId)!,
      stall: stalls.find(s => s.id === sp.stallId)!
    }));
  }, [stallProducts, stalls, search]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cotações do Dia</h1>
            <p className="text-slate-500 font-medium">Preços atualizados em tempo real direto do CEASA.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Buscar por produto ou variedade..." 
              className="h-14 pl-12 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-orange-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-6 py-3 flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">Última Atualização</p>
              <p className="text-sm font-black text-orange-900">Hoje, às 05:30</p>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dailyOffers.map((offer) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 bg-white rounded-[32px] group">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={offer.product.image} 
                  alt={offer.product.nome_exibicao} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="space-y-1">
                    <Badge className="bg-orange-500 text-white border-none font-black text-[10px] uppercase tracking-widest px-2 py-1">
                      Preço do Dia
                    </Badge>
                    <h3 className="text-white font-black text-xl leading-tight">
                      {offer.product.nome_exibicao}
                    </h3>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                      {offer.product.subclassificacao}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
                    <Zap className="w-5 h-5 text-orange-400 fill-orange-400" />
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100">
                      <img src={offer.stall.image} alt={offer.stall.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Vendido por</p>
                      <Link to={`/barracas/${offer.stall.id}`} className="text-sm font-black text-slate-900 hover:text-orange-600 transition-colors">
                        {offer.stall.name}
                      </Link>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Unidade</p>
                    <p className="text-sm font-bold text-slate-600">{offer.product.unidade_medida}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Preço Atual</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-orange-600">R$</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      addToCart({
                        ...offer,
                        quantity: 1
                      });
                      toast.success(`${offer.product.nome_exibicao} adicionado!`);
                    }}
                    className="h-14 w-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 transition-all active:scale-90"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {dailyOffers.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Nenhum preço encontrado</h3>
          <p className="text-slate-500">Tente buscar por outro termo ou volte mais tarde.</p>
        </div>
      )}
    </motion.div>
  );
}
