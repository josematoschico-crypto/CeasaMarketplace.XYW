import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, Plus, Clock, ShieldCheck, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { STALL_PRODUCTS, PRODUCTS } from '../data/mock';
import { CartItem, Product, StallProduct } from '../types/index';
import { groupProductsByBase } from '../lib/utils';
import { useStalls } from '../context/StallsContext';
import { useAuth } from '../context/AuthContext';

interface StallDetailPageProps {
  addToCart: (item: CartItem) => void;
}

export default function StallDetailPage({ addToCart }: StallDetailPageProps) {
  const { id } = useParams();
  const { user } = useAuth();
  const { stalls, stallProducts: allStallProducts } = useStalls();
  const stall = stalls.find(s => s.id === id);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  if (!stall) return <div>Barraca não encontrada</div>;

  // Memoize offers to avoid recalculating on every render
  const stallOffers = useMemo(() => 
    allStallProducts.filter(sp => sp.stallId === stall.id), 
  [stall.id, allStallProducts]);

  // Memoize products to avoid recalculating on every render
  const stallProducts = useMemo(() => {
    const groupedOffers = stallOffers.reduce((acc, offer) => {
      if (!acc[offer.productId]) acc[offer.productId] = [];
      acc[offer.productId].push(offer);
      return acc;
    }, {} as Record<string, StallProduct[]>);
    
    return Object.keys(groupedOffers).map(productId => {
      const firstOffer = groupedOffers[productId][0];
      return firstOffer.product || PRODUCTS.find(p => p.id === productId);
    }).filter(Boolean) as Product[];
  }, [stallOffers]);

  // Group products by category, then by grupo_base using the optimized utility function
  const groupedByCategoryAndBase = useMemo(() => {
    const productsByCategory = stallProducts.reduce((acc, product) => {
      if (!acc[product.categoria]) acc[product.categoria] = [];
      acc[product.categoria].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    const result: Record<string, Record<string, Product[]>> = {};
    for (const [category, products] of Object.entries(productsByCategory)) {
      result[category] = groupProductsByBase(products as Product[]);
    }
    return result;
  }, [stallProducts]);

  const toggleExpand = (grupo_base: string) => {
    setExpandedProduct(expandedProduct === grupo_base ? null : grupo_base);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center gap-4">
        <Link to="/barracas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Detalhes da Barraca</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <img 
              src={stall.image} 
              alt={stall.name} 
              className="w-full h-48 object-cover"
              referrerPolicy="no-referrer"
            />
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{stall.name}</h2>
                  {stall.isNew && (
                    <Badge className="bg-green-500 text-white border-none font-bold px-2 py-0.5 text-[10px]">
                      [NOVO]
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{stall.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg">{stall.rating}</span>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-slate-500 text-sm">
                  <p className="font-bold text-slate-900">{stall.isNew ? '0' : '1.2k+'}</p>
                  <p>Vendas</p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Vendedor Verificado CEASA</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 p-2">
                  <Clock className="w-4 h-4" />
                  <span>Aberto: 04:00 - 14:00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Tabela de Cotação</h3>
            <Badge variant="outline" className="bg-white">{stallOffers.length} Ofertas</Badge>
          </div>

          <div className="space-y-8">
            {stallOffers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-medium">Nenhuma oferta disponível no momento.</p>
              </div>
            ) : (
              Object.entries(groupedByCategoryAndBase).map(([category, baseGroups]) => (
                <div key={category} className="space-y-4">
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-sm flex items-center gap-2">
                    {category}
                    <div className="h-px bg-slate-200 flex-1" />
                  </h4>
                  
                  <div className="space-y-3">
                    {Object.entries(baseGroups).map(([grupo_base, products]) => {
                      // Get all offers for these products
                      const variations = stallOffers.filter(offer => products.some(p => p.id === offer.productId));
                      const isExpanded = expandedProduct === grupo_base;
                      const baseProduct = products[0]; // Use first product for generic info
                      
                      return (
                        <Card key={grupo_base} className="border-none shadow-sm overflow-hidden bg-white">
                          {/* Main Row */}
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => toggleExpand(grupo_base)}
                          >
                            <div className="flex items-center gap-4">
                              <img src={baseProduct.image} alt={baseProduct.nome_exibicao} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                              <div>
                                <h5 className="font-bold text-slate-900 text-lg">{baseProduct.nome_exibicao}</h5>
                                <p className="text-sm text-slate-500">{variations.length} {variations.length === 1 ? 'variação' : 'variações'} disponíveis</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                <p className="text-xs text-slate-400">A partir de</p>
                                <div className="flex flex-col items-end">
                                  {variations.some(v => v.isDailyOffer) && (
                                    <Badge className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0 mb-1 border-none">
                                      OFERTA DO DIA
                                    </Badge>
                                  )}
                                  <p className="font-bold text-green-700">
                                    R$ {Math.min(...variations.map(v => v.isDailyOffer ? v.dailyOfferPrice! : v.price)).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="text-slate-400">
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </Button>
                            </div>
                          </div>

                          {/* Variations Accordion */}
                          {isExpanded && (
                            <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-3">
                              {variations.map(offer => {
                                const product = products.find(p => p.id === offer.productId)!;
                                return (
                                  <div key={offer.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border shadow-sm gap-4 transition-all ${
                                    offer.isDailyOffer 
                                      ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-100' 
                                      : 'bg-white border-slate-100'
                                  }`}>
                                    <div className="flex items-center gap-3">
                                      <div className={`w-1.5 h-8 rounded-full ${offer.isDailyOffer ? 'bg-orange-500' : 'bg-green-500'}`} />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="font-bold text-slate-800">
                                            {product.subclassificacao || 'Padrão'}
                                          </p>
                                          {offer.isDailyOffer && (
                                            <Badge className="bg-orange-500 text-white text-[10px] font-black px-2 py-0 border-none">
                                              OFERTA DO DIA
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                          Venda por {product.unidade_medida} • Estoque: {offer.stock}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                      <div className="text-right">
                                        {offer.isDailyOffer ? (
                                          <>
                                            <p className="text-[10px] text-slate-400 line-through font-bold">
                                              R$ {offer.price.toFixed(2)}
                                            </p>
                                            <p className="font-black text-xl text-orange-600">
                                              R$ {offer.dailyOfferPrice?.toFixed(2)}
                                            </p>
                                          </>
                                        ) : (
                                          <p className="font-black text-lg text-slate-900">
                                            R$ {offer.price.toFixed(2)}
                                          </p>
                                        )}
                                      </div>
                                      {user?.role !== 'seller' && (
                                        <Button 
                                          size="sm" 
                                          className={`${
                                            offer.isDailyOffer 
                                              ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' 
                                              : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                          } text-white rounded-xl h-10 px-4 font-bold shadow-md`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart({
                                              ...offer,
                                              price: offer.isDailyOffer ? offer.dailyOfferPrice! : offer.price,
                                              product,
                                              stall,
                                              quantity: 1
                                            });
                                            toast.success(`${product.nome_exibicao} (${product.subclassificacao || 'Padrão'}) adicionado!`);
                                          }}
                                        >
                                          <Plus className="w-4 h-4 mr-1" />
                                          Comprar
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
