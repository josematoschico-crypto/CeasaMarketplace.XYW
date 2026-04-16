import { motion } from 'framer-motion';
import { Store, MapPin, Star, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useStalls } from '../context/StallsContext';

export default function StallsPage() {
  const { stalls } = useStalls();
  const [search, setSearch] = useState('');

  const filteredStalls = stalls.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">Barracas no CEASA</h1>
          <p className="text-slate-500 text-sm">Encontre os melhores produtores e distribuidores.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link to="/cadastro-vendedor">
            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 w-full sm:w-auto">
              <Store className="w-4 h-4" /> Seja um Vendedor
            </Button>
          </Link>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar barraca ou pavilhão..." 
              className="pl-10 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStalls.map(stall => (
          <Link key={stall.id} to={`/barracas/${stall.id}`}>
            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group relative">
              {(stall as any).isNew && (
                <Badge className="absolute top-3 left-3 z-10 bg-green-500 text-white border-none font-bold px-2 py-0.5 animate-pulse">
                  [NOVO]
                </Badge>
              )}
              <div className="h-40 relative">
                <img 
                  src={stall.image} 
                  alt={stall.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div className="text-white">
                    <h3 className="font-bold text-xl">{stall.name}</h3>
                    <p className="text-white/80 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {stall.location}
                    </p>
                  </div>
                  <Badge className="bg-yellow-400 text-yellow-900 border-none flex gap-1 items-center">
                    <Star className="w-3 h-3 fill-current" /> {stall.rating}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px]">Atacado</Badge>
                  <Badge variant="outline" className="text-[10px]">Varejo</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-green-600 gap-1">
                  Ver Produtos <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
