import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Store, 
  MapPin, 
  Box, 
  Camera, 
  CheckCircle2, 
  ChevronRight, 
  Users,
  ShieldCheck,
  Zap,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

import { useStalls } from '../context/StallsContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { processImageFile } from '../lib/image-utils';

export default function SellerRegistrationPage() {
  const navigate = useNavigate();
  const { addStall } = useStalls();
  const { register, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newStallId, setNewStallId] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    whatsapp: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
    stallName: '',
    pavilion: '',
    boxNumber: '',
    logo: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.whatsapp || !formData.password || !formData.confirmPassword || !formData.ownerName) {
        toast.error('Preencha todos os campos de acesso.');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem.');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!formData.stallName || !formData.pavilion || !formData.boxNumber || !formData.logo) {
      toast.error('Preencha todos os dados, incluindo a foto da barraca.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedStallId = `s_new_${Date.now()}`;
      setNewStallId(generatedStallId);

      // Create new stall object
      const newStall = {
        id: generatedStallId,
        name: formData.stallName,
        ownerId: '', // Will be set in register
        location: `Pavilhão ${formData.pavilion}, Box ${formData.boxNumber}`,
        rating: 5.0,
        image: formData.logo || 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800',
        isNew: true,
        isActive: true
      };

      // Register the user and stall
      const uid = await register(formData.whatsapp, formData.password, formData.ownerName, 'seller', generatedStallId);
      
      // Explicitly update the user with the barracaId as requested for "Atualização Posterior"
      await updateUser(uid, { barracaId: generatedStallId });
      
      // Add stall to context (should ideally be in Firestore too)
      // ownerId must match the authenticated user's UID
      const stallWithCorrectOwner = {
        ...newStall,
        ownerId: uid
      };
      await addStall(stallWithCorrectOwner);
      
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
              onClick={() => navigate('/painel-vendedor')}
            >
              Ir para Login
            </Button>
          </div>,
          { duration: 6000 }
        );
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Configuração pendente: O provedor de E-mail/Senha precisa ser ativado no Console do Firebase.');
      } else {
        toast.error(errorMessage || 'Erro ao realizar cadastro. Tente novamente.');
      }
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file);
        setFormData(prev => ({ ...prev, logo: base64 }));
      } catch (error) {
        console.error('Error processing logo:', error);
        toast.error('Erro ao processar imagem.');
      }
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
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
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-slate-900 mb-4"
        >
          Sua barraca está no ar! 🚀
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-600 text-lg mb-12 max-w-md mx-auto leading-relaxed"
        >
          Parabéns! Você já está visível para milhares de compradores no CEASA Market. 
          Agora, cadastre seu primeiro lote para começar a vender hoje mesmo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xs"
        >
          <Button 
            onClick={() => navigate(`/painel-vendedor/${newStallId}`)}
            className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xl shadow-xl shadow-green-100"
          >
            Ir para Meu Painel
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-6 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-black text-slate-900">Seja um Vendedor</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-8 space-y-8">
        {/* Social Proof Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-600 rounded-3xl p-6 text-white shadow-lg shadow-green-200 flex items-center gap-4"
        >
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-black text-lg leading-tight">Sua Barraca Online</p>
            <p className="text-green-100 text-sm font-medium">em menos de 2 minutos.</p>
          </div>
        </motion.div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <span className={`text-sm font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>Acesso</span>
          </div>
          <div className="h-px bg-slate-200 flex-1 mx-4" />
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <span className={`text-sm font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>Barraca</span>
          </div>
        </div>

        {/* Form Cards */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Seu Nome Completo</Label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        placeholder="Ex: João da Silva"
                        value={formData.ownerName}
                        onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 text-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        placeholder="(00) 00000-0000"
                        value={formData.whatsapp}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '');
                          let formatted = digits;
                          if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                          if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
                          if (formatted.length <= 15) {
                            setFormData(prev => ({ ...prev, whatsapp: formatted }));
                          }
                        }}
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 text-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Crie uma Senha</Label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">(A senha deve ter pelo menos 6 caracteres)</span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 text-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Confirme a Senha</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 text-lg font-medium"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleNext}
                className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xl shadow-xl shadow-slate-200"
              >
                Próximo Passo
                <ChevronRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  {/* Logo Upload */}
                  <div className="flex flex-col items-center gap-4 mb-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Camera className="w-6 h-6 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Logo</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 bg-green-600 p-1.5 rounded-tl-xl">
                        <Zap className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foto da Barraca (Obrigatório)</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Nome da Barraca</Label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        placeholder="Ex: Hortifruti do Zé"
                        value={formData.stallName}
                        onChange={e => setFormData(prev => ({ ...prev, stallName: e.target.value }))}
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 text-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pavilhão</Label>
                      <Select 
                        value={formData.pavilion} 
                        onValueChange={val => setFormData(prev => ({ ...prev, pavilion: val }))}
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-lg font-medium">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Pavilhão A</SelectItem>
                          <SelectItem value="B">Pavilhão B</SelectItem>
                          <SelectItem value="C">Pavilhão C</SelectItem>
                          <SelectItem value="D">Pavilhão D</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Box / Pedra</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                          placeholder="Ex: 12"
                          value={formData.boxNumber}
                          onChange={e => setFormData(prev => ({ ...prev, boxNumber: e.target.value }))}
                          className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 text-lg font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-20 rounded-3xl bg-green-600 hover:bg-green-700 text-white font-black text-2xl shadow-2xl shadow-green-200 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? 'Ativando...' : 'Ativar Minha Barraca Agora'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  className="w-full h-12 text-slate-400 font-bold"
                >
                  Voltar para o passo anterior
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Cadastro 100% Seguro</span>
        </div>
      </div>
    </div>
  );
}
