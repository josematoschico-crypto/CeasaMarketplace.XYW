import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, MapPin, Search as SearchIcon, Loader2, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { CartItem } from '../types';
import { toast } from 'sonner';

interface CartPageProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
}

export default function CartPage({ cart, removeFromCart, updateQuantity }: CartPageProps) {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<any>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [dynamicFreight, setDynamicFreight] = useState(0);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const fee = subtotal * 0.05;
  const total = subtotal + dynamicFreight + fee;

  const handleCepLookup = async () => {
    if (cep.length !== 8) {
      toast.error('CEP inválido. Digite 8 números.');
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error('CEP não encontrado.');
        setAddress(null);
        setDynamicFreight(0);
      } else {
        setAddress(data);
        // Simulate dynamic freight calculation based on region
        // SP: 25, RJ: 45, MG: 55, Others: 75
        const region = data.uf;
        let freightValue = 75;
        if (region === 'SP') freightValue = 25;
        else if (region === 'RJ') freightValue = 45;
        else if (region === 'MG') freightValue = 55;
        
        setDynamicFreight(freightValue);
        toast.success('Endereço localizado e frete calculado!');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 space-y-6"
      >
        <div className="bg-slate-100 p-8 rounded-full">
          <ShoppingCart className="w-16 h-16 text-slate-300" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Seu carrinho está vazio</h2>
          <p className="text-slate-500">Que tal dar uma olhada nos produtos do dia?</p>
        </div>
        <Link to="/produtos">
          <Button className="bg-green-600 hover:bg-green-700 px-8">Ver Produtos</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <h1 className="text-3xl font-bold">Meu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Product List */}
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <img 
                    src={item.product.image} 
                    alt={item.product.nome_exibicao} 
                    className="w-24 h-24 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{item.product.nome_exibicao}</h3>
                        {item.product.subclassificacao && (
                          <Badge variant="outline" className="mt-1 text-xs border-green-200 text-green-700 bg-green-50">
                            {item.product.subclassificacao}
                          </Badge>
                        )}
                        <p className="text-sm text-slate-500 mt-1">{item.stall.name}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-red-50"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3 text-red-500" />
                        </Button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-green-50"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3 text-green-600" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">R$ {item.price.toFixed(2)} / {item.product.unidade_medida}</p>
                        <p className="font-bold text-green-700">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Delivery Address Section */}
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Endereço de Entrega</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">Digite seu CEP</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="cep" 
                        placeholder="00000-000" 
                        value={cep}
                        onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className="font-mono"
                      />
                      <Button 
                        onClick={handleCepLookup} 
                        disabled={isLoadingCep}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isLoadingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {address && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-2"
                      >
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <p className="text-sm font-bold text-slate-700">{address.logradouro}</p>
                          <p className="text-xs text-slate-500">{address.bairro} - {address.localidade}/{address.uf}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-slate-400">Número</Label>
                            <Input placeholder="Ex: 123" size={1} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-slate-400">Complemento</Label>
                            <Input placeholder="Apto, Bloco..." />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-48 md:h-full min-h-[220px] rounded-2xl overflow-hidden border border-slate-100 relative bg-slate-100 shadow-inner">
                  {address ? (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Maps"
                      src={
                        import.meta.env.VITE_GOOGLE_MAPS_API_KEY && import.meta.env.VITE_GOOGLE_MAPS_API_KEY.startsWith('AIza')
                          ? `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${address.logradouro}, ${address.localidade}, ${address.uf}`)}`
                          : `https://maps.google.com/maps?q=${encodeURIComponent(`${address.logradouro}, ${address.localidade}, ${address.uf}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-3 p-6 text-center">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
                        <MapPin className="w-6 h-6 opacity-40" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-500">Mapa de Entrega</p>
                        <p className="text-xs">Insira o CEP para visualizar a localização exata no Google Maps</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-xl">Resumo do Pedido</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Produtos</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 items-center">
                  <div className="flex items-center gap-1">
                    <span>Frete Dinâmico</span>
                    {dynamicFreight > 0 && <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-50 text-green-600 border-green-200">Calculado</Badge>}
                  </div>
                  <span className={dynamicFreight > 0 ? 'text-green-600 font-bold' : ''}>
                    {dynamicFreight > 0 ? `R$ ${dynamicFreight.toFixed(2)}` : 'A calcular'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxa de Intermediação (5%)</span>
                  <span>R$ {fee.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total Geral</span>
                  <span className="text-slate-900">R$ {total.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="block w-full">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg gap-2"
                  disabled={dynamicFreight === 0}
                >
                  {dynamicFreight === 0 ? 'Calcule o Frete para Continuar' : 'Finalizar Compra'} <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                <Package className="w-3 h-3" />
                <span>Entrega garantida pela logística CEASA</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
