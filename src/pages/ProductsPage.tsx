import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Plus, Minus, Info } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PRODUCTS, STALL_PRODUCTS, STALLS } from '../data/mock';
import { CartItem, Product } from '../types';
import { useStalls } from '../context/StallsContext';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

interface ProductsPageProps {
  addToCart: (item: CartItem) => void;
}

export default function ProductsPage({ addToCart }: ProductsPageProps) {
  const { stallProducts } = useStalls();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  // Combine static products with dynamic products from stalls
  const allAvailableProducts = useMemo(() => {
    const dynamicProducts = stallProducts.map(sp => sp.product).filter(Boolean) as Product[];
    return [...PRODUCTS, ...dynamicProducts];
  }, [stallProducts]);

  const categories = useMemo(() => 
    ['Todos', ...new Set(allAvailableProducts.map(p => p.categoria))],
  [allAvailableProducts]);

  // Group products by grupo_base
  const groupedProducts = useMemo(() => {
    return Object.values(
      allAvailableProducts.reduce((acc, p) => {
        if (!acc[p.grupo_base]) {
          acc[p.grupo_base] = {
            grupo_base: p.grupo_base,
            nome_exibicao: p.nome_exibicao,
            categoria: p.categoria,
            unidade_medida: p.unidade_medida,
            image: p.image,
            subclassificacoes: []
          };
        }
        if (!acc[p.grupo_base].subclassificacoes.includes(p.subclassificacao)) {
          acc[p.grupo_base].subclassificacoes.push(p.subclassificacao);
        }
        return acc;
      }, {} as Record<string, any>)
    );
  }, [allAvailableProducts]);

  const filteredGroups = groupedProducts.filter(g => {
    const searchLower = search.toLowerCase();
    const matchesSearch = g.nome_exibicao.toLowerCase().includes(searchLower) || 
                          g.subclassificacoes.some((sub: string) => sub.toLowerCase().includes(searchLower));
    const matchesCategory = category === 'Todos' || g.categoria === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos do Dia</h1>
        {user?.role !== 'seller' && (
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Buscar tomate, banana..." 
                className="pl-10 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <Button 
            key={cat} 
            variant={category === cat ? 'default' : 'outline'}
            size="sm"
            className={`rounded-full whitespace-nowrap transition-all border-none ${
              category === cat 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map(group => {
          // Find all stalls selling any variation of this product group
          const groupProductIds = allAvailableProducts.filter(p => p.grupo_base === group.grupo_base).map(p => p.id);
          const stallOffers = stallProducts.filter(sp => groupProductIds.includes(sp.productId));
          
          return (
            <Card key={group.grupo_base} className="overflow-hidden border-none shadow-sm bg-white">
              <div className="aspect-video relative">
                <img 
                  src={group.image} 
                  alt={group.nome_exibicao} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <Badge className="absolute top-3 left-3 bg-green-100/90 text-green-700 backdrop-blur-sm border-none font-bold">
                  {group.categoria}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-xl">{group.nome_exibicao}</h3>
                  <p className="text-slate-500 text-sm">Unidade de venda: {group.unidade_medida}</p>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {group.subclassificacoes.slice(0, 3).map((sub: string) => (
                    <Badge key={sub} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5">
                      {sub}
                    </Badge>
                  ))}
                  {group.subclassificacoes.length > 3 && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5">
                      +{group.subclassificacoes.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stallOffers.length} ofertas disponíveis</p>
                  </div>
                  <Link to={`/produtos/${group.grupo_base}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                      Ver Preços e Variações
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
