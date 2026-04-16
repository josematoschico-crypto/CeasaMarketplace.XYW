import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Truck, CheckCircle2, Clock, ChevronRight, 
  MapPin, Phone, Circle, ArrowLeft, Zap, Info, MessageCircle, Activity, ShoppingBag,
  Star, ThumbsUp, ThumbsDown, AlertCircle, ClipboardCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { Order, QualityFeedback } from '../types';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';

function QualityChecklist({ order }: { order: Order }) {
  const { updateOrderFeedback } = useOrders();
  const [rating, setRating] = useState<'bom' | 'regular' | 'ruim' | null>(order.qualityFeedback?.rating || null);
  const [checklist, setChecklist] = useState({
    frescor: order.qualityFeedback?.checklist.frescor || false,
    aparencia: order.qualityFeedback?.checklist.aparencia || false,
    tamanho: order.qualityFeedback?.checklist.tamanho || false,
    embalagem: order.qualityFeedback?.checklist.embalagem || false,
  });
  const [comments, setComments] = useState(order.qualityFeedback?.comments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error('Por favor, selecione uma avaliação geral.');
      return;
    }

    setIsSubmitting(true);
    const feedback: QualityFeedback = {
      rating,
      checklist,
      comments,
      submittedAt: new Date().toISOString(),
    };

    try {
      await updateOrderFeedback(order.id, feedback);
      toast.success('Avaliação enviada com sucesso! Obrigado pelo feedback.');
    } catch (error) {
      toast.error('Erro ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (order.qualityFeedback) {
    return (
      <div className="bg-green-50 p-6 rounded-[32px] border border-green-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Qualidade Avaliada</h4>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`
            ${order.qualityFeedback.rating === 'bom' ? 'bg-green-600' : 
              order.qualityFeedback.rating === 'regular' ? 'bg-yellow-500' : 'bg-red-500'} 
            text-white border-none px-4 py-1 rounded-full font-black uppercase text-[10px]
          `}>
            {order.qualityFeedback.rating}
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            Enviado em {new Date(order.qualityFeedback.submittedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
        {order.qualityFeedback.comments && (
          <p className="text-sm text-slate-600 italic bg-white/50 p-3 rounded-xl border border-green-50">
            "{order.qualityFeedback.comments}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-xl shadow-sm">
          <ClipboardCheck className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Checklist de Qualidade</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avalie o produto recebido</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'bom', label: 'Bom', icon: ThumbsUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { id: 'regular', label: 'Regular', icon: Circle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
          { id: 'ruim', label: 'Ruim', icon: ThumbsDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setRating(item.id as any)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              rating === item.id 
                ? `${item.bg} ${item.border} scale-105 shadow-sm` 
                : 'bg-white border-transparent grayscale opacity-60 hover:opacity-100'
            }`}
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">O que estava correto?</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'frescor', label: 'Frescor' },
            { id: 'aparencia', label: 'Aparência' },
            { id: 'tamanho', label: 'Tamanho' },
            { id: 'embalagem', label: 'Embalagem' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-xs transition-all ${
                checklist[item.id as keyof typeof checklist]
                  ? 'bg-green-600 border-green-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${checklist[item.id as keyof typeof checklist] ? 'text-white' : 'text-slate-200'}`} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">Comentários Adicionais</p>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Conte-nos mais sobre a qualidade..."
          className="w-full h-24 rounded-2xl border border-slate-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none bg-white"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !rating}
        className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
      </Button>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, getOrdersByBuyer } = useOrders();
  const { user } = useAuth();
  const [isTrackingMode, setIsTrackingMode] = useState(false);

  const buyerOrders = user ? getOrdersByBuyer(user.id) : [];
  const trackableOrders = buyerOrders.filter(o => o.status === 'shipped' || o.status === 'delivered' || o.status === 'preparing');

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'preparing': return { label: 'Preparando', color: 'bg-blue-100 text-blue-600', icon: Package };
      case 'shipped': return { label: 'Em Rota', color: 'bg-purple-100 text-purple-600', icon: Truck };
      case 'delivered': return { label: 'Entregue', color: 'bg-green-100 text-green-600', icon: CheckCircle2 };
      default: return { label: 'Pendente', color: 'bg-orange-100 text-orange-600', icon: Clock };
    }
  };

  if (isTrackingMode) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl mx-auto space-y-12 pb-20"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsTrackingMode(false)} className="bg-white shadow-sm border border-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rastreamento em Tempo Real</h1>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest">
            {trackableOrders.length} Pedidos Ativos
          </Badge>
        </div>

        {trackableOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {trackableOrders.map((order) => (
              <div key={order.id} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="font-black text-slate-900 text-xl">Pedido #{order.id.replace('ORD-', '')}</h2>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Cód: {order.id}
                  </Badge>
                </div>

                {/* Status Card */}
                <Card className="border-none shadow-xl bg-white rounded-[40px] overflow-hidden border border-slate-100">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={`${order.status === 'delivered' ? 'bg-green-100' : 'bg-green-50'} p-4 rounded-2xl`}>
                        {order.status === 'delivered' ? (
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        ) : (
                          <Truck className="w-8 h-8 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {order.status === 'delivered' ? 'Pedido Entregue!' : 'Pedido a caminho!'}
                        </h3>
                        <p className="text-slate-500 text-xs font-medium">
                          {order.status === 'delivered' 
                            ? `Entregue em ${new Date(order.date).toLocaleDateString('pt-BR')}` 
                            : 'Previsão: 14:30 - 15:00'}
                        </p>
                      </div>
                    </div>

                    {/* Mini Timeline */}
                    <div className="flex justify-between items-center px-2">
                      {['pending', 'preparing', 'shipped', 'delivered'].map((step, idx, arr) => {
                        const isCompleted = arr.findIndex(s => s === order.status) >= idx;
                        return (
                          <div key={step} className="flex flex-col items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-600' : 'bg-slate-200'}`} />
                            <div className={`h-1 w-full ${isCompleted ? 'bg-green-600' : 'bg-slate-200'}`} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Map Placeholder */}
                    <div className="relative h-48 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map-${order.id}`}
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.106653140656!2d-46.73602512373059!3d-23.53225886043136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce56425333798f%3A0x86877296067769!2sCEAGESP!5e0!3m2!1spt-BR!2sbr!4v1711990000000!5m2!1spt-BR!2sbr"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-white flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-slate-900 uppercase">LIVE</span>
                      </div>
                    </div>

                    {/* Driver Card */}
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm">
                          <img 
                            src={order.driver?.photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"} 
                            alt={order.driver?.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{order.driver?.name || 'Motorista'}</h4>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-bold">{order.driver?.truck.split(' - ')[0] || 'Caminhão HR'}</span>
                            <span className="text-[10px] font-mono text-green-600 font-black">{order.driver?.truck.split(' - ')[1] || 'ABC-1234'}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-[#25D366] text-white hover:bg-[#128C7E] rounded-xl px-4 h-10 font-bold text-xs flex items-center gap-2"
                        onClick={() => {
                          const phone = order.driver?.phone || '0000000000';
                          window.open(`https://wa.me/55${phone}`, '_blank');
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                    </div>

                    {/* Lalamove Tracking */}
                    {order.logistics && (
                      <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-orange-600" />
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Rastreio Lalamove</span>
                          </div>
                          <Badge className="bg-orange-600 text-white border-none text-[8px] font-black uppercase">
                            {order.logistics.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 bg-orange-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-orange-600"
                              initial={{ width: '0%' }}
                              animate={{ 
                                width: order.logistics.status === 'ASSIGNING_DRIVER' ? '20%' :
                                       order.logistics.status === 'PICKED_UP' ? '50%' :
                                       order.logistics.status === 'ON_THE_WAY' ? '80%' : '100%'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-[8px] font-bold text-orange-400 uppercase tracking-tighter">
                          <span>Coleta</span>
                          <span>Em Rota</span>
                          <span>Entregue</span>
                        </div>

                        <div className="pt-2 border-t border-orange-100 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-orange-400 font-bold uppercase">Veículo</span>
                            <span className="text-[10px] text-orange-700 font-black">{order.logistics.vehicleType}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] text-orange-400 font-bold uppercase">Taxa</span>
                            <span className="text-[10px] text-orange-700 font-black">R$ {order.logistics.fee}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Nenhum pedido em rota</h2>
            <p className="text-slate-500 mt-2">Seus pedidos aparecerão aqui assim que saírem para entrega.</p>
            <Button 
              variant="outline" 
              onClick={() => setIsTrackingMode(false)}
              className="mt-8 rounded-2xl px-8 h-12 font-bold"
            >
              Voltar para Meus Pedidos
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meus Pedidos</h1>
        <div className="bg-green-100 p-2 rounded-xl">
          <ShoppingBag className="w-6 h-6 text-green-600" />
        </div>
      </div>

      {/* Recent Activities Section for Buyer */}
      <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Atividades Recentes</h3>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="space-y-3">
            {buyerOrders.filter(o => o.status === 'delivered').slice(0, 3).length > 0 ? (
              buyerOrders
                .filter(o => o.status === 'delivered')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3)
                .map((order) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={order.id} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Pedido #{order.id.replace('ORD-', '')}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(order.date).toLocaleDateString('pt-BR')} às {new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white border-none text-[10px] font-black uppercase px-3 py-1 rounded-full">
                      Entregue
                    </Badge>
                  </motion.div>
                ))
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400">Nenhuma entrega recente confirmada.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {buyerOrders.map((order) => {
          const status = getStatusInfo(order.status);
          return (
            <Card key={order.id} className="border-none shadow-lg bg-white rounded-[32px] overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <Package className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xl text-slate-900">{order.id}</h3>
                          <Badge className={`${status.color} border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{order.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Pago</p>
                        <p className="font-black text-2xl text-green-600">R$ {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-50" />

                  {/* Detailed Items */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Itens do Pedido</h4>
                    <div className="grid gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                              <Zap className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 text-[15px]">{item.name}</p>
                                {item.subclassification && (
                                  <Badge variant="outline" className="text-[10px] border-green-200 text-green-700 bg-green-50 px-1.5 py-0">
                                    {item.subclassification}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[13px] text-slate-500 mt-0.5">Vendido por: <span className="font-semibold text-green-600">{order.stallName || 'Sua Barraca'}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-[15px]">{item.quantity}x</p>
                            <p className="text-[13px] text-slate-400 mt-0.5">R$ {item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {order.status === 'delivered' ? (
                    <div className="space-y-6">
                      <div className="w-full bg-green-600 text-white rounded-2xl h-14 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-green-100">
                        <CheckCircle2 className="w-5 h-5" />
                        Pedido Entregue
                      </div>
                      
                      <QualityChecklist order={order} />
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setIsTrackingMode(true)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 transition-all active:scale-[0.98]"
                    >
                      <Truck className="w-5 h-5 mr-2" />
                      Acompanhamento
                    </Button>
                  )}
                </div>

                {order.status === 'shipped' && (
                  <div className="bg-green-600 p-4 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <p className="text-sm text-white font-bold">
                        Pedido em rota de entrega!
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
