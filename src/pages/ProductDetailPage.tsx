import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Store, Info, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PRODUCTS } from '../data/mock';
import { CartItem, Product, StallProduct } from '../types';
import { useStalls } from '../context/StallsContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetailPageProps {
  addToCart: (item: CartItem) => void;
}

export default function ProductDetailPage({ addToCart }: ProductDetailPageProps) {
  const { id: grupo_base } = useParams();
  const { user } = useAuth();
  const { stalls: allStalls, stallProducts: allStallProducts } = useStalls();
  
  // Find all products that belong to this grupo_base
  const groupProducts = PRODUCTS.filter(p => p.grupo_base === grupo_base);
  
  const [selectedSubclass, setSelectedSubclass] = useState<string>('Todos');

  if (groupProducts.length === 0) return <div>Produto não encontrado</div>;

  // Use the first product to get generic info (name, image, category, unit)
  const baseProduct = groupProducts[0];

  // Get all unique subclassifications for this group
  const allSubclassifications = [...new Set(groupProducts.map(p => p.subclassificacao))];
  const subclassifications = ['Todos', ...allSubclassifications];

  // Get all stall offers for any product in this group
  const groupProductIds = groupProducts.map(p => p.id);
  const allOffers = allStallProducts.filter(sp => groupProductIds.includes(sp.productId));

  // Filter offers based on selected subclassification
  const offers = allOffers.filter(offer => {
    const product = groupProducts.find(p => p.id === offer.productId) || offer.product;
    if (!product) return false;
    if (selectedSubclass !== 'Todos' && product.subclassificacao !== selectedSubclass) return false;
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      <div className="flex items-center gap-4">
        <Link to="/produtos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{baseProduct.nome_exibicao}</h1>
      </div>

      {/* Product Hero */}
      <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <img 
          src={baseProduct.image} 
          alt={baseProduct.nome_exibicao} 
          className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl"
          referrerPolicy="no-referrer"
        />
        <div className="space-y-2 text-center md:text-left">
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">{baseProduct.categoria}</Badge>
          <h2 className="text-2xl font-bold text-slate-900">{baseProduct.nome_exibicao}</h2>
          <p className="text-slate-500">Unidade de venda: <span className="font-bold text-slate-700">{baseProduct.unidade_medida}</span></p>
        </div>
      </div>

      {/* Subclassifications Pills */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Filtre por Classificação</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {subclassifications.map(sub => (
            <Button 
              key={sub} 
              variant={selectedSubclass === sub ? 'default' : 'outline'}
              className={`rounded-full whitespace-nowrap transition-all border-2 ${
                selectedSubclass === sub 
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:bg-green-50'
              }`}
              onClick={() => setSelectedSubclass(sub)}
            >
              {sub}
            </Button>
          ))}
        </div>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Ofertas Disponíveis ({offers.length})</h3>
        
        {offers.length > 0 ? (
          <div className="grid gap-4">
            {offers.map(offer => {
              const stall = allStalls.find(s => s.id === offer.stallId);
              if (!stall) return null;
              
              const product = groupProducts.find(p => p.id === offer.productId) || offer.product;
              if (!product) return null;

              return (
                <Card key={offer.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
                      
                      {/* Stall Info */}
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                          <img src={stall.image} alt={stall.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <Link to={`/barracas/${stall.id}`} className="hover:underline">
                            <h4 className="font-bold text-slate-900 flex items-center gap-1">
                              <Store className="w-4 h-4 text-slate-400" />
                              {stall.name}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="flex items-center text-yellow-500 font-bold"><Star className="w-3 h-3 fill-current mr-0.5" /> {stall.rating}</span>
                            <span>•</span>
                            <span>{stall.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Offer Details */}
                      <div className="flex items-center justify-between w-full md:w-auto gap-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="text-left md:text-right">
                          {product.subclassificacao && (
                            <Badge variant="outline" className="mb-1 text-xs border-green-200 text-green-700 bg-green-50">
                              {product.subclassificacao}
                            </Badge>
                          )}
                          <p className="text-2xl font-black text-green-700">R$ {offer.price.toFixed(2)}</p>
                          <p className="text-xs text-slate-400 font-medium">Estoque: {offer.stock} {baseProduct.unidade_medida}s</p>
                        </div>
                        
                        {user?.role !== 'seller' && (
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
                            onClick={() => {
                              addToCart({
                                ...offer,
                                product,
                                stall,
                                quantity: 1
                              });
                              toast.success(`${baseProduct.nome_exibicao} (${product.subclassificacao || 'Padrão'}) adicionado!`);
                            }}
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Adicionar
                          </Button>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <Info className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Nenhuma oferta encontrada</h3>
            <p className="text-slate-500 max-w-md mt-2">
              Não encontramos barracas vendendo esta classificação no momento. Tente selecionar outra opção.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
