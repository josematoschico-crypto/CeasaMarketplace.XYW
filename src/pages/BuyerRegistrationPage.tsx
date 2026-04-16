import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Phone, Lock, User, CheckCircle2, ShoppingBag, Bell, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function BuyerRegistrationPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    password: '',
    confirmPassword: ''
  });

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'whatsapp') {
      setFormData(prev => ({ ...prev, [id]: formatWhatsApp(value) }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.password || !formData.confirmPassword) {
      toast.error('Preencha todos os campos.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData.whatsapp, formData.password, formData.name, 'buyer');
      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || '';
      if (errorMessage.includes('já está cadastrado')) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p>{errorMessage}</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => navigate('/painel-comprador')}
            >
              Ir para Login
            </Button>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage || 'Erro ao realizar cadastro. Tente novamente.');
      }
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Cadastro Realizado!</h1>
        <p className="text-slate-500 mb-8 max-w-md">
          Bem-vindo ao CEASA Market. Agora você pode comprar e receber ofertas exclusivas.
        </p>
        <Button 
          onClick={() => navigate('/produtos')}
          className="bg-green-600 hover:bg-green-700 text-white h-14 px-12 rounded-2xl font-bold text-lg"
        >
          Começar a Comprar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Benefits */}
        <div className="hidden lg:flex flex-col space-y-8 pr-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 leading-tight">
              Sua jornada no <span className="text-green-600">CEASA Market</span> começa aqui.
            </h1>
            <p className="text-lg text-slate-500">
              Cadastre-se como comprador e tenha acesso a preços exclusivos direto do produtor.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Compra Direta</h3>
                <p className="text-slate-500 text-sm">Compre de centenas de barracas em um só lugar.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Alertas de Ofertas</h3>
                <p className="text-slate-500 text-sm">Receba as melhores cotações do dia no seu WhatsApp.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Histórico de Preços</h3>
                <p className="text-slate-500 text-sm">Acompanhe a variação dos preços e economize.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <Card className="border-none shadow-2xl shadow-slate-200 rounded-[32px] overflow-hidden bg-white">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 px-3 py-1">
                Área do Comprador
              </Badge>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Crie sua conta</h2>
              <p className="text-slate-500">É rápido, fácil e gratuito.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    id="name" 
                    placeholder="Como devemos te chamar?" 
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    id="whatsapp" 
                    placeholder="(00) 00000-0000" 
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••" 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••" 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-200 transition-all mt-4"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Finalizar Cadastro
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Já tem uma conta? <Link to="/painel-comprador" className="text-green-600 font-bold hover:underline">Entrar agora</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
