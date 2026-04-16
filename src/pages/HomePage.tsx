import { motion } from 'framer-motion';
import { ShoppingCart, Star, Clock, ChevronRight, TrendingUp, Leaf, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { PRODUCTS, STALLS as MOCK_STALLS } from '../data/mock';
import { useStalls } from '../context/StallsContext';
import { useAuth } from '../context/AuthContext';
import { Product, Stall } from '../types';

export default function HomePage() {
  const { stalls, stallProducts } = useStalls();
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = ['Frutas', 'Legumes', 'Verduras', 'Ovos', 'Grãos', 'Temperos'];

  // Combine static products with dynamic products from stalls
  const allAvailableProducts = useMemo(() => {
    const dynamicProducts = stallProducts.map(sp => sp.product).filter(Boolean) as Product[];
    return [...PRODUCTS, ...dynamicProducts];
  }, [stallProducts]);

  // Group products by grupo_base for display
  const groupedProducts = useMemo(() => {
    return Object.values(
      allAvailableProducts.reduce((acc, p) => {
        if (!acc[p.grupo_base]) {
          acc[p.grupo_base] = {
            id: p.grupo_base,
            grupo_base: p.grupo_base,
            nome_exibicao: p.nome_exibicao,
            categoria: p.categoria,
            unidade_medida: p.unidade_medida,
            image: p.image,
          };
        }
        return acc;
      }, {} as Record<string, any>)
    );
  }, [allAvailableProducts]);

  const filteredProducts = activeCategory 
    ? groupedProducts.filter(p => p.categoria === activeCategory)
    : groupedProducts.slice(0, 8); // Show more by default if no category

  // Get top rated stalls (Best Stalls)
  const topStalls = useMemo(() => {
    return [...stalls]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [stalls]);

  // Get new stalls
  const newStalls = useMemo(() => {
    return stalls
      .filter(s => s.isNew)
      .slice(0, 3);
  }, [stalls]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
          alt="CEASA" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8 md:px-16 space-y-4">
          <Link to="/precos-do-dia" className="w-fit">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Badge className="bg-orange-500 hover:bg-orange-600 border-none px-4 py-2 text-sm sm:text-base font-black shadow-[0_0_20px_rgba(249,115,22,0.5)] cursor-pointer">
                PREÇOS DO DIA ATUALIZADOS
              </Badge>
            </motion.div>
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            O Melhor do <span className="text-green-400">Campo</span> <br className="hidden sm:block" />
            <span className="text-green-400">Direto para</span> Você
          </h1>
          <p className="text-slate-200 max-w-md text-sm sm:text-base md:text-lg font-medium leading-relaxed">
            Abasteça seu negócio ou sua casa com produtos frescos direto do CEASA. Economia e qualidade garantida.
          </p>
          <div className="flex gap-4">
            {user?.role !== 'seller' && (
              <Link to="/produtos">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">Comprar Agora</Button>
              </Link>
            )}
            <Link to="/barracas">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white border-none shadow-lg shadow-green-500/20">Ver Barracas</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Leaf, title: '100% Fresco', desc: 'Colhido e entregue no mesmo dia.', color: 'bg-green-100 text-green-600' },
          { icon: TrendingUp, title: 'Preço de Atacado', desc: 'Economize comprando direto da fonte.', color: 'bg-blue-100 text-blue-600' },
          { icon: Truck, title: 'Entrega Rápida', desc: 'Logística própria para todo o estado.', color: 'bg-orange-100 text-orange-600' },
        ].map((f, i) => (
          <Card key={i} className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold">Categorias</h2>
          <Link to="/produtos" className="text-green-600 text-sm font-medium flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <Button 
            variant={activeCategory === null ? 'default' : 'outline'}
            className={`rounded-full px-6 whitespace-nowrap transition-all border-none ${
              activeCategory === null 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            onClick={() => setActiveCategory(null)}
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button 
              key={cat} 
              variant={activeCategory === cat ? 'default' : 'outline'}
              className={`rounded-full px-6 whitespace-nowrap transition-all border-none ${
                activeCategory === cat 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold">
            {activeCategory ? `Produtos em ${activeCategory}` : 'Destaques do Dia'}
          </h2>
          <Link to="/produtos" className="text-green-600 text-sm font-medium flex items-center gap-1">
            Ver mais <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <Link key={p.id} to={`/produtos/${p.grupo_base}`}>
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={p.image} 
                    alt={p.nome_exibicao} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <Badge className="absolute top-2 left-2 bg-green-100/90 text-green-700 backdrop-blur-sm border-none font-bold">
                    {p.categoria}
                  </Badge>
                </div>
                <CardContent className="p-3 space-y-1">
                  <h3 className="font-bold text-sm md:text-base line-clamp-1">{p.nome_exibicao}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Unidade: {p.unidade_medida}</span>
                    <span className="text-green-600 font-bold">Ver Preços</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              Nenhum produto encontrado nesta categoria.
            </div>
          )}
        </div>
      </section>

      {/* Featured Stalls */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold">Melhores Barracas</h2>
          <Link to="/barracas" className="text-green-600 text-sm font-medium flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topStalls.map((s) => (
            <Link key={s.id} to={`/barracas/${s.id}`}>
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group relative">
                <div className="h-32 relative">
                  <img 
                    src={s.image} 
                    alt={s.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 border-none flex gap-1 items-center">
                    <Star className="w-3 h-3 fill-current" /> {s.rating}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{s.location}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* New Stalls Section */}
      {newStalls.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Novas Barracas</h2>
              <Badge className="bg-green-500 text-white border-none animate-pulse">CHEGARAM AGORA</Badge>
            </div>
            <Link to="/barracas" className="text-green-600 text-sm font-medium flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newStalls.map((s) => (
              <Link key={s.id} to={`/barracas/${s.id}`}>
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group relative">
                  <Badge className="absolute top-3 left-3 z-10 bg-green-400 text-green-950 border-none font-black px-3 py-1 text-xs shadow-lg shadow-green-500/20">
                    NOVO
                  </Badge>
                  <div className="h-32 relative">
                    <img 
                      src={s.image} 
                      alt={s.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 border-none flex gap-1 items-center">
                      <Star className="w-3 h-3 fill-current" /> {s.rating}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{s.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Seller CTA Banner */}
      {!isAuthenticated && (
        <section className="bg-slate-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <Badge className="bg-green-500 hover:bg-green-600 border-none px-3 py-1">Para Produtores</Badge>
              <h2 className="text-3xl md:text-4xl font-black leading-tight">
                Junte-se a +150 barracas <br /> <span className="text-green-400">que já vendem online na CEASA hoje.</span>
              </h2>
              <p className="text-slate-400 max-w-md text-lg">
                Junte-se ao maior marketplace B2B da CEASA e venda para milhares de compradores todos os dias.
              </p>
            </div>
            <Link to="/cadastro-vendedor">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xl shadow-xl shadow-green-900/20 transition-all active:scale-[0.98]">
                Ativar Minha Barraca
              </Button>
            </Link>
          </div>
        </section>
      )}
    </motion.div>
  );
}
