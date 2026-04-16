import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Lock, Phone, ShoppingBag, Bell, TrendingUp, CheckCircle2, Loader2, LogOut, Package, Truck, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BuyerDashboardPage() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Form state
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryWhatsapp, setRecoveryWhatsapp] = useState('');

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    if (formatted.length <= 15) {
      setWhatsapp(formatted);
    }
  };

  const handleRecoveryWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    if (formatted.length <= 15) {
      setRecoveryWhatsapp(formatted);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecovering(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold">Senha enviada! 🚀</p>
          <p className="text-xs">Sua senha foi enviada para o WhatsApp {recoveryWhatsapp}. Verifique suas mensagens.</p>
        </div>
      );
      
      setShowForgotPassword(false);
      setRecoveryWhatsapp('');
    } catch (error: any) {
      toast.error('Erro ao recuperar senha. Verifique o número e tente novamente.');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      await login(whatsapp, password);
      toast.success(`Bem-vindo de volta, ${whatsapp}!`);
      setIsLoggingIn(false);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'WhatsApp ou senha incorretos. Verifique seus dados.');
      setIsLoggingIn(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 space-y-8"
      >
        <div className="text-center space-y-4 max-w-sm">
          <div className="bg-blue-50 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-10 h-10 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel do Comprador</h1>
            <p className="text-slate-500 font-medium">Acesse sua conta para ver seus pedidos e ofertas.</p>
          </div>
        </div>

        <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] bg-white rounded-[48px] overflow-hidden">
          <CardContent className="p-10">
            <AnimatePresence mode="wait">
              {!showForgotPassword ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-black text-sm ml-1">WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                          <Input 
                            type="tel" 
                            placeholder="(00) 00000-0000" 
                            value={whatsapp}
                            onChange={handleWhatsAppChange}
                            className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-500 transition-all text-lg font-medium"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-black text-sm ml-1">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-500 transition-all text-lg font-medium"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoggingIn}
                      className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-80"
                    >
                      {isLoggingIn ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Acessando...</span>
                        </div>
                      ) : (
                        "Entrar como Comprador"
                      )}
                    </Button>
                  </form>
                  
                  <div className="mt-8 text-center space-y-4">
                    <p className="text-slate-500 text-sm">
                      Esqueci minha senha, <button onClick={() => setShowForgotPassword(true)} className="text-blue-600 font-bold hover:underline">Clique aqui</button>
                    </p>
                    <p className="text-slate-500 text-sm">
                      Não tem uma conta? <Link to="/cadastro-comprador" className="text-blue-600 font-bold hover:underline">Cadastre-se aqui</Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot-password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black text-slate-900">Recuperar Senha</h2>
                      <p className="text-slate-500 text-sm">Insira seu WhatsApp cadastrado para receber sua senha.</p>
                    </div>

                    <form onSubmit={handleRecoverPassword} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-black text-sm ml-1">WhatsApp Cadastrado</Label>
                        <div className="relative">
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                          <Input 
                            type="tel" 
                            placeholder="(00) 00000-0000" 
                            value={recoveryWhatsapp}
                            onChange={handleRecoveryWhatsAppChange}
                            className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-500 transition-all text-lg font-medium"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isRecovering}
                        className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-80"
                      >
                        {isRecovering ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Enviando...</span>
                          </div>
                        ) : (
                          "Enviar Senha via WhatsApp"
                        )}
                      </Button>

                      <Button 
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForgotPassword(false)}
                        className="w-full text-slate-500 font-bold"
                      >
                        Voltar para o Login
                      </Button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-8 pb-32"
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="bg-white shadow-sm border border-slate-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Olá, {user?.name || 'Comprador'}</h1>
            <p className="text-slate-500 text-sm font-medium">Bem-vindo ao seu painel exclusivo.</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} className="text-red-500 hover:bg-red-50 rounded-full">
          <LogOut className="w-6 h-6" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <div className="bg-green-50 p-3 rounded-2xl">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">12</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pedidos Totais</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <div className="bg-blue-50 p-3 rounded-2xl">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">2</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Em Trânsito</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Atividade Recente</h2>
          <Link to="/pedidos" className="text-blue-600 text-sm font-bold">Ver todos</Link>
        </div>
        
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Pedido #827{i}</p>
                    <p className="text-xs text-slate-500">Realizado em 05/04/2026</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-none">Entregue</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Exclusive Offers */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Ofertas para Você</h2>
        <Card className="border-none shadow-lg shadow-blue-100 rounded-[32px] bg-blue-600 text-white overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="space-y-4 relative z-10">
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md">EXCLUSIVO</Badge>
              <h3 className="text-2xl font-black leading-tight">Ganhe 10% OFF no seu próximo pedido acima de R$ 500</h3>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-black rounded-xl h-12">Resgatar Cupom</Button>
            </div>
            <ShoppingBag className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
