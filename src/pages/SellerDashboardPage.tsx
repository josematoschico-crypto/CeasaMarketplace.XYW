import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Camera, ArrowLeft, Edit2, CheckCircle2, XCircle, Store, Lock, Mail, Image as ImageIcon, Calendar, PackagePlus, Check, Search, Plus, Loader2, Phone, LogOut, ShoppingBag, User, Clock, Truck, Package, MapPin, MessageCircle, Activity, Zap, Folder, Sparkles, ClipboardCheck, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { classifyProductImage, ClassificationResult } from '../services/geminiService';
import { createLalamovePayload, lalamoveApi } from '../services/lalamoveService';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { STALL_PRODUCTS, PRODUCTS, STALLS, MOCK_SELLERS } from '../data/mock';
import { PRODUCT_TAXONOMY } from '../data/taxonomy';
import { Stall, StallProduct, Order } from '../types/index';
import { useAuth } from '../context/AuthContext';
import { useStalls } from '../context/StallsContext';
import { useOrders } from '../context/OrdersContext';
import { processImageFile } from '../lib/image-utils';

// Currency Formatting Helpers
const formatToBRL = (value: string | number) => {
  if (typeof value === 'number') {
    value = Math.round(value * 100).toString();
  }
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const numberValue = parseInt(digits, 10) / 100;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseBRL = (formattedValue: string): number => {
  const digits = formattedValue.replace(/\D/g, '');
  return (parseInt(digits, 10) || 0) / 100;
};

const PhotoSourcePicker = ({ onImageCaptured }: { onImageCaptured: (base64: string) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file);
        onImageCaptured(base64);
      } catch (error) {
        console.error('Error processing photo:', error);
        toast.error('Erro ao processar imagem.');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-2 w-full max-w-[320px] mx-auto space-y-1"
    >
      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
      >
        <ImageIcon className="w-6 h-6 text-slate-900" />
        <span className="font-bold text-slate-900 text-lg">Fototeca</span>
      </button>
      
      <div className="h-px bg-slate-100 mx-4" />

      <button 
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
      >
        <Camera className="w-6 h-6 text-slate-900" />
        <span className="font-bold text-slate-900 text-lg">Tirar Foto</span>
      </button>

      <div className="h-px bg-slate-100 mx-4" />

      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
      >
        <Folder className="w-6 h-6 text-slate-900" />
        <span className="font-bold text-slate-900 text-lg">Escolher Arquivo</span>
      </button>

      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
    </motion.div>
  );
};

export default function SellerDashboardPage() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { 
    stalls: allStalls, 
    stallProducts: allStallProducts, 
    addStallProduct, 
    updateStallProduct, 
    batchUpdateStallProducts,
    updateStall
  } = useStalls();
  const { getOrdersByStall, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'stock' | 'add' | 'orders' | 'feedback'>('stock');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormSaved, setIsFormSaved] = useState(false);
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

  // Route Protection & Auto-Redirection
  useEffect(() => {
    if (isAuthenticated && user?.barracaId) {
      if (!id) {
        // Redirect to their specific dashboard if they hit the base URL
        navigate(`/painel-vendedor/${user.barracaId}`, { replace: true });
      } else if (id !== user.barracaId) {
        // Security Guard: Redirect if trying to access another stall
        toast.error('Acesso negado. Redirecionando para sua barraca.');
        navigate(`/painel-vendedor/${user.barracaId}`, { replace: true });
      }
    }
  }, [isAuthenticated, user, id, navigate]);
  
  // Logged in seller info
  const sellerStallId = id || user?.barracaId || 's1'; 
  const stallInfo = allStalls.find(s => s.id === sellerStallId) || STALLS.find(s => s.id === sellerStallId);
  
  const [myProducts, setMyProducts] = useState<any[]>([]);

  useEffect(() => {
    if (sellerStallId) {
      const products = allStallProducts.filter(sp => sp.stallId === sellerStallId).map(sp => {
        const product = sp.product || PRODUCTS.find(p => p.id === sp.productId);
        if (!product) return null;
        return { 
          ...sp, 
          product,
          yesterdayPrice: sp.yesterdayPrice || sp.price,
          marketAverage: sp.marketAverage || sp.price * 1.05,
          photoDate: sp.photoDate || '03/04'
        };
      }).filter(Boolean) as any[];
      setMyProducts(products);
    }
  }, [sellerStallId, allStallProducts]);

  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Add Product State (Batch Selection)
  const [searchTerm, setSearchTerm] = useState('');
  const [categoria, setCategoria] = useState('');
  const [grupoBase, setGrupoBase] = useState('');
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [variationData, setVariationData] = useState<Record<string, { 
    price: string, 
    photo: string, 
    isAnalyzing?: boolean, 
    aiResult?: ClassificationResult | null 
  }>>({});

  // Custom Product State
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState(false);
  const [aiResultCustom, setAiResultCustom] = useState<ClassificationResult | null>(null);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [customUnitOther, setCustomUnitOther] = useState('');
  const [customVariation, setCustomVariation] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customPhoto, setCustomPhoto] = useState('');
  const customPhotoInputRef = useRef<HTMLInputElement>(null);
  const stallPhotoInputRef = useRef<HTMLInputElement>(null);

  const categorias = Object.keys(PRODUCT_TAXONOMY).sort();

  const allProducts = useMemo(() => {
    return Object.entries(PRODUCT_TAXONOMY).flatMap(([cat, prods]) => 
      Object.values(prods).map(p => ({ ...p, categoria: cat }))
    ).sort((a, b) => a.nome_exibicao.localeCompare(b.nome_exibicao));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return allProducts.filter(p => p.nome_exibicao.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, allProducts]);

  const produtoSelecionado = (categoria && grupoBase && !isCustomProduct && PRODUCT_TAXONOMY[categoria]) ? PRODUCT_TAXONOMY[categoria][grupoBase] : null;
  const subclassificacoes = produtoSelecionado ? produtoSelecionado.subclassificacoes : [];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      await login(whatsapp, password);
      toast.success(`Bem-vindo de volta!`);
      setIsLoggingIn(false);
      // The useEffect in AuthContext will handle the user state and navigation
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'WhatsApp ou senha incorretos. Verifique seus dados.');
      setIsLoggingIn(false);
    }
  };

  const handleStallPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && stallInfo) {
      try {
        const base64 = await processImageFile(file);
        await updateStall({
          ...stallInfo,
          image: base64
        });
        toast.success('Foto da barraca atualizada com sucesso!');
      } catch (error) {
        console.error('Error updating stall photo:', error);
        toast.error('Erro ao atualizar foto da barraca.');
      }
    }
  };

  const handleSaveEdit = async (updatedItem: any) => {
    const itemWithSaved = { ...updatedItem, isSaved: true };
    setMyProducts(prev => prev.map(p => p.id === itemWithSaved.id ? itemWithSaved : p));
    await updateStallProduct(itemWithSaved);

    // Lalamove Automation for Daily Update
    if (updatedItem.aiResult && updatedItem.aiResult.logistica_metadata.condition_status !== 'ruim') {
      const payload = createLalamovePayload(
        updatedItem.aiResult,
        updatedItem.stock || 100,
        { lat: -23.532258, lng: -46.736025, address: 'CEAGESP - Pavilhão A' },
        { lat: -23.550520, lng: -46.633308, address: 'Supermercado Central' },
        updatedItem.id
      );
      
      const quotation = await lalamoveApi.getQuotation(payload);
      await lalamoveApi.placeOrder(quotation.id, payload);
      toast.success(`Logística Lalamove agendada (${payload.service_type})`, {
        icon: <Truck className="w-5 h-5 text-green-600" />
      });
    }
    
    // Give a small delay so user can see the "SALVO" state
    setTimeout(() => {
      setEditingItem(null);
      toast.success('Lote do dia publicado com sucesso!');
      setActiveTab('stock'); // Stay in stock tab if editing existing
    }, 800);
  };

  const toggleVariation = (id_suffix: string) => {
    setIsFormSaved(false);
    setSelectedVariations(prev => {
      if (prev.includes(id_suffix)) {
        const next = prev.filter(id => id !== id_suffix);
        const newData = { ...variationData };
        delete newData[id_suffix];
        setVariationData(newData);
        return next;
      } else {
        const finalProductId = `${produtoSelecionado?.id_prefix}_${id_suffix}`;
        const existingProduct = myProducts.find(p => p.product.id === finalProductId);
        const prefilledPrice = existingProduct ? existingProduct.price.toString() : '';
        
        setVariationData(d => ({ ...d, [id_suffix]: { price: prefilledPrice, photo: '' } }));
        return [...prev, id_suffix];
      }
    });
  };

  const updateVariationData = (id_suffix: string, field: 'price' | 'photo' | 'isAnalyzing' | 'aiResult', value: any) => {
    setIsFormSaved(false);
    setVariationData(prev => ({
      ...prev,
      [id_suffix]: {
        ...prev[id_suffix],
        [field]: value
      }
    }));
  };

  const handleAiClassificationVariation = async (id_suffix: string, base64: string) => {
    updateVariationData(id_suffix, 'isAnalyzing', true);
    try {
      const result = await classifyProductImage(base64);
      if (result) {
        updateVariationData(id_suffix, 'aiResult', result);
        
        // Security Validation: Block if condition is poor
        if (result.logistica_metadata.condition_status === 'ruim') {
          toast.error('ALERTA: IA detectou produto em más condições. Envio bloqueado para evitar rejeição.', {
            duration: 6000,
            icon: <AlertCircle className="w-5 h-5 text-red-500" />
          });
        } else {
          toast.success(`Identificação automática para ${id_suffix} concluída!`);
        }
      }
    } catch (error) {
      console.error('AI Classification error:', error);
    } finally {
      updateVariationData(id_suffix, 'isAnalyzing', false);
    }
  };

  const handleAiClassificationCustom = async (base64: string) => {
    setIsAnalyzingCustom(true);
    try {
      const result = await classifyProductImage(base64);
      if (result) {
        setAiResultCustom(result);
        
        // Security Validation: Block if condition is poor
        if (result.logistica_metadata.condition_status === 'ruim') {
          toast.error('ALERTA: IA detectou produto em más condições. Envio bloqueado para evitar rejeição.', {
            duration: 6000,
            icon: <AlertCircle className="w-5 h-5 text-red-500" />
          });
        } else {
          // Pre-fill fields if they are empty
          if (!customName) setCustomName(result.produto_principal);
          if (!customVariation) setCustomVariation(result.variedade);
          toast.success('Identificação automática concluída!');
        }
      }
    } catch (error) {
      console.error('AI Classification error:', error);
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  const handleBatchSubmit = async () => {
    setIsSubmitting(true);
    setIsFormSaved(false);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 800));

      if (isCustomProduct) {
        const finalUnit = customUnit === 'Outra...' ? customUnitOther : customUnit;
        const numericPrice = parseBRL(customPrice);
        if (!customName || !customCategory || !finalUnit || !numericPrice || !customPhoto) {
          toast.error('Preencha todos os campos obrigatórios, incluindo a foto do lote.');
          setIsSubmitting(false);
          return;
        }

        const newProduct = {
          id: `sp_new_${Date.now()}`,
          stallId: sellerStallId,
          productId: `PROD_CUSTOM_${Date.now()}`,
          price: numericPrice,
          stock: 100,
          updatedAt: new Date().toISOString(),
          yesterdayPrice: numericPrice,
          marketAverage: numericPrice,
          photoDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          isSaved: true,
          product: {
            id: `PROD_CUSTOM_${Date.now()}`,
            grupo_base: customName.toLowerCase().replace(/\s+/g, '_'),
            nome_exibicao: customName,
            subclassificacao: customVariation || 'Padrão',
            categoria: customCategory,
            unidade_medida: finalUnit,
            image: customPhoto || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
          }
        };

        setMyProducts(prev => [newProduct, ...prev]);
        addStallProduct(newProduct);

        // Lalamove Automation
        if (aiResultCustom && aiResultCustom.logistica_metadata.condition_status !== 'ruim') {
          const payload = createLalamovePayload(
            aiResultCustom,
            100, // Default stock as quantity for simulation
            { lat: -23.532258, lng: -46.736025, address: 'CEAGESP - Pavilhão A' },
            { lat: -23.550520, lng: -46.633308, address: 'Supermercado Central' },
            newProduct.id
          );
          
          const quotation = await lalamoveApi.getQuotation(payload);
          await lalamoveApi.placeOrder(quotation.id, payload);
          toast.success(`Logística Lalamove agendada (${payload.service_type})`, {
            icon: <Truck className="w-5 h-5 text-green-600" />
          });
        }
        
        toast.success(
          <div className="space-y-1">
            <p>✅ <strong>{customName} {customVariation}</strong> adicionada com sucesso.</p>
            <p>✅ Preço R$ {parseFloat(customPrice).toFixed(2)}/{customUnit === 'Outra...' ? customUnitOther : customUnit} atualizado.</p>
            <p className="mt-2 text-green-700 font-bold">🚀 Seu produto já está visível para os compradores.</p>
          </div>,
          { duration: 5000 }
        );
        
        setIsFormSaved(true);
        
        // Reset form after delay
        setTimeout(() => {
          setIsCustomProduct(false);
          setCustomName('');
          setCustomCategory('');
          setCustomUnit('');
          setCustomUnitOther('');
          setCustomVariation('');
          setCustomPrice('');
          setCustomPhoto('');
          setIsFormSaved(false);
          setActiveTab('stock'); // Go to stock to see the new item
        }, 1500);
        return;
      }

      if (selectedVariations.length === 0) {
        toast.error('Selecione pelo menos uma variação.');
        return;
      }

      const newProducts: any[] = [];
      const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      for (const suffix of selectedVariations) {
        const data = variationData[suffix];
        const numericPrice = parseBRL(data.price);
        const subDef = subclassificacoes.find(s => s.id_suffix === suffix);
        
        if (!numericPrice || !data.photo) {
          toast.error(`Preencha o preço e tire uma foto para a variação ${subDef?.nome || suffix}.`);
          setIsSubmitting(false);
          return;
        }

        if (!subDef || !produtoSelecionado) continue;

        const finalProductId = `${produtoSelecionado.id_prefix}_${subDef.id_suffix}`;

        newProducts.push({
          id: `sp_new_${Date.now()}_${suffix}`,
          stallId: sellerStallId,
          productId: finalProductId,
          price: numericPrice,
          stock: 100, // Default active stock
          updatedAt: new Date().toISOString(),
          yesterdayPrice: numericPrice,
          marketAverage: numericPrice,
          photoDate: todayStr,
          isSaved: true,
          product: {
            id: finalProductId,
            grupo_base: produtoSelecionado.grupo_base,
            nome_exibicao: produtoSelecionado.nome_exibicao,
            subclassificacao: subDef.nome,
            categoria,
            unidade_medida: produtoSelecionado.unidade_medida,
            image: data.photo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
          }
        });
      }

      const existingProductIds = newProducts.map(np => np.productId);
      const filteredPrev = myProducts.filter(p => !existingProductIds.includes(p.productId));
      const updated = [...newProducts, ...filteredPrev];
      
      setMyProducts(updated);
      
      // Update context in a single batch outside state setter
      await batchUpdateStallProducts(newProducts);
      
      toast.success(
        <div className="space-y-2">
          {newProducts.map(p => (
            <div key={p.id} className="border-b border-green-100 pb-2 last:border-0 last:pb-0">
              <p>✅ <strong>{p.product.nome_exibicao} {p.product.subclassificacao}</strong> adicionada com sucesso.</p>
              <p>✅ Preço R$ {p.price.toFixed(2)}/{p.product.unidade_medida} atualizado.</p>
            </div>
          ))}
          <p className="pt-1 text-green-700 font-bold">🚀 {newProducts.length === 1 ? 'Seu produto já está visível' : 'Seus produtos já estão visíveis'} para os compradores.</p>
        </div>,
        { duration: 5000 }
      );
      
      setIsFormSaved(true);
      
      // Reset form after delay
      setTimeout(() => {
        setSearchTerm('');
        setCategoria('');
        setGrupoBase('');
        setSelectedVariations([]);
        setVariationData({});
        setIsFormSaved(false);
        setActiveTab('stock'); // Go to stock to see the new items
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group products by base product
  const groupedOffers = myProducts.reduce((acc, item) => {
    if (!item.product) return acc;
    const base = item.product.grupo_base;
    if (!acc[base]) acc[base] = [];
    acc[base].push(item);
    return acc;
  }, {} as Record<string, typeof myProducts>);

  if (!isAuthenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 space-y-8"
      >
        <div className="text-center space-y-4 max-w-sm">
          <div className="bg-green-50 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto shadow-sm">
            <Store className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel do Produtor</h1>
            <p className="text-slate-500 font-medium">Acesse sua barraca para atualizar os lotes do dia.</p>
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
                            className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-green-500 transition-all text-lg font-medium"
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
                            className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-green-500 transition-all text-lg font-medium"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoggingIn}
                      className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xl shadow-xl shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-80"
                    >
                      {isLoggingIn ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Acessando...</span>
                        </div>
                      ) : (
                        "Entrar na Barraca"
                      )}
                    </Button>

                    <div className="space-y-4 pt-2 text-center">
                      <p className="text-slate-500 text-sm">
                        Esqueci minha senha, <button onClick={() => setShowForgotPassword(true)} className="text-green-600 font-bold hover:underline">Clique aqui</button>
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-slate-500">Ainda não tem uma barraca?</span>
                        <Link to="/cadastro-vendedor" className="text-green-600 font-bold hover:underline">
                          Cadastre-se aqui
                        </Link>
                      </div>
                    </div>
                  </form>
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
                            className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-green-500 transition-all text-lg font-medium"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isRecovering}
                        className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xl shadow-xl shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-80"
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
      className="max-w-2xl mx-auto space-y-6 pb-32"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="bg-white shadow-sm border border-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          {/* Stall Photo Change Field */}
          <div className="relative group">
            <div 
              onClick={() => stallPhotoInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500 transition-all"
            >
              {stallInfo?.image ? (
                <img 
                  src={stallInfo.image} 
                  alt={stallInfo.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={stallPhotoInputRef}
              onChange={handleStallPhotoChange}
            />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Painel do Produtor</h1>
            <div className="flex flex-col">
              <p className="text-sm text-slate-500 font-medium">{stallInfo?.name}</p>
              <p className="text-xs text-green-600 font-bold">Bem-vindo, {user?.name}</p>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={async () => {
            await logout();
            navigate('/painel-vendedor');
          }}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl">
        <button
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'stock' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('stock')}
        >
          Estoque Diário
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'add' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('add')}
        >
          Adicionar Lotes
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'orders' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag className="w-4 h-4" />
          Comprador
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'feedback' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('feedback')}
        >
          <ClipboardCheck className="w-4 h-4" />
          Feedback
        </button>
      </div>

      {/* Recent Activities Section */}
      <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">Atividades Recentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="space-y-3">
            {getOrdersByStall(id || '').filter(o => o.status === 'delivered').slice(0, 3).length > 0 ? (
              getOrdersByStall(id || '')
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

      {activeTab === 'stock' && (
        <div className="space-y-8">
          {Object.entries(groupedOffers).map(([grupoBase, itemsArray]) => {
          const items = itemsArray as typeof myProducts;
          const baseName = items[0].product.nome_exibicao;
          
          return (
            <div key={grupoBase} className="space-y-4">
              <h2 className="font-black text-slate-400 uppercase tracking-widest text-sm flex items-center gap-3">
                {baseName}
                <div className="h-px bg-slate-200 flex-1" />
              </h2>
              
              <div className="grid gap-4">
                {items.map(item => (
                  <StockItemCard key={item.id} item={item} onSave={handleSaveEdit} onEditFull={() => setEditingItem(item)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {activeTab === 'add' && (
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-2xl">
                  <PackagePlus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Adicionar Novos Lotes</CardTitle>
                  <CardDescription className="text-slate-500 text-sm mt-1">
                    Selecione a categoria e o produto base.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!isCustomProduct && !produtoSelecionado && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">1. Buscar Produto Base</Label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        type="text" 
                        placeholder="Ex: Batata, Maçã, Tomate..." 
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsFormSaved(false);
                        }}
                        className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 text-lg"
                      />
                    </div>
                  </div>

                  {searchTerm && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(prod => (
                          <button
                            key={prod.grupo_base}
                            onClick={() => {
                              setCategoria(prod.categoria);
                              setGrupoBase(prod.grupo_base);
                              setSearchTerm('');
                            }}
                            className="w-full flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{prod.nome_exibicao}</p>
                              <p className="text-sm text-slate-500">{prod.categoria}</p>
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                              {prod.unidade_medida}
                            </Badge>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          Nenhum produto encontrado.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      className="w-full h-14 rounded-xl border-dashed border-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      onClick={() => {
                        setIsCustomProduct(true);
                        if (searchTerm) setCustomName(searchTerm);
                      }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {searchTerm ? `Adicionar "${searchTerm}" como novo produto` : 'Adicionar produto não listado'}
                    </Button>
                  </div>
                </div>
              )}

              {isCustomProduct && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-slate-700 font-bold text-lg">Novo Produto Customizado</Label>
                    <Button variant="ghost" size="sm" onClick={() => setIsCustomProduct(false)} className="text-slate-500">
                      Cancelar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Nome do Produto</Label>
                    <Input 
                      value={customName}
                      onChange={e => {
                        setCustomName(e.target.value);
                        setIsFormSaved(false);
                      }}
                      placeholder="Ex: Pitaya Vermelha"
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <select
                        value={customCategory}
                        onChange={e => {
                          setCustomCategory(e.target.value);
                          setIsFormSaved(false);
                        }}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                      >
                        <option value="" disabled>Selecione</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade de Medida</Label>
                      <select
                        value={customUnit}
                        onChange={e => {
                          setCustomUnit(e.target.value);
                          setIsFormSaved(false);
                        }}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                      >
                        <option value="" disabled>Selecione</option>
                        <option value="Caixa 20kg">Caixa 20kg</option>
                        <option value="Saco 50kg">Saco 50kg</option>
                        <option value="Maço">Maço</option>
                        <option value="Unidade">Unidade</option>
                        <option value="Kg">Kg</option>
                        <option value="Outra...">Outra...</option>
                      </select>
                      {customUnit === 'Outra...' && (
                        <Input 
                          value={customUnitOther}
                          onChange={e => {
                            setCustomUnitOther(e.target.value);
                            setIsFormSaved(false);
                          }}
                          placeholder="Ex: Fardo 30kg"
                          className="h-12 rounded-xl mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Variação / Qualidade (Opcional)</Label>
                    <Input 
                      value={customVariation}
                      onChange={e => {
                        setCustomVariation(e.target.value);
                        setIsFormSaved(false);
                      }}
                      placeholder="Ex: Padrão, Extra, Tipo A"
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço Diário (R$)</Label>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      value={customPrice}
                      onChange={e => {
                        setCustomPrice(formatToBRL(e.target.value));
                        setIsFormSaved(false);
                      }}
                      placeholder="0,00"
                      className="h-14 text-xl font-bold rounded-xl"
                    />
                  </div>

                    {/* Photo Capture for Custom Product */}
                    <div className="space-y-2 pt-2">
                      <Label className="text-slate-500 font-bold text-xs uppercase tracking-wider">Foto do Lote (Obrigatório)</Label>
                      {customPhoto ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200">
                          <img src={customPhoto} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                            onClick={() => {
                              setCustomPhoto('');
                              setAiResultCustom(null);
                              setIsFormSaved(false);
                            }}
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      ) : (
                        <PhotoSourcePicker onImageCaptured={(base64) => {
                          setCustomPhoto(base64);
                          setIsFormSaved(false);
                          handleAiClassificationCustom(base64);
                        }} />
                      )}
                    </div>

                    {isAnalyzingCustom && (
                      <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                        <p className="text-sm font-bold text-green-700">IA analisando produto...</p>
                      </div>
                    )}

                    {aiResultCustom && !isAnalyzingCustom && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <h3 className="text-white font-bold text-xs uppercase tracking-widest">Identificação IA</h3>
                          </div>
                          <Badge className="bg-green-500 text-white border-none text-[10px]">
                            {aiResultCustom.confianca_identificacao}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Variedade</p>
                            <p className="text-white text-xs font-bold">{aiResultCustom.variedade}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Classificação</p>
                            <p className="text-white text-xs font-bold">{aiResultCustom.classificacao_comercial}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  <Button 
                    onClick={handleBatchSubmit}
                    disabled={isSubmitting}
                    className={`w-full h-14 rounded-xl font-black text-lg shadow-lg transition-all active:scale-[0.98] ${
                      isFormSaved 
                        ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100 text-white' 
                        : 'bg-green-600 hover:bg-green-700 shadow-green-100 text-white'
                    }`}
                  >
                    {isSubmitting ? 'Salvando...' : (isFormSaved ? 'SALVO' : 'Salvar Novo Produto')}
                  </Button>
                </motion.div>
              )}

              {/* Passo 3: Variações em Lote */}
              <AnimatePresence>
                {produtoSelecionado && !isCustomProduct && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-bold text-slate-900">{produtoSelecionado.nome_exibicao}</p>
                        <p className="text-sm text-slate-500">{categoria} • {produtoSelecionado.unidade_medida}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setGrupoBase(''); setCategoria(''); }} className="text-slate-500">
                        Trocar
                      </Button>
                    </div>

                    <Label className="text-slate-700 font-bold block mt-4">2. Quais variações você trouxe hoje?</Label>
                    <div className="flex flex-wrap gap-3">
                      {subclassificacoes.map(sub => {
                        const isSelected = selectedVariations.includes(sub.id_suffix);
                        return (
                          <button
                            key={sub.id_suffix}
                            type="button"
                            onClick={() => toggleVariation(sub.id_suffix)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                              isSelected 
                                ? 'bg-green-50 border-green-500 text-green-800 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            {sub.nome}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Dynamic Quick Fill Cards */}
          <AnimatePresence>
            {selectedVariations.map(suffix => {
              const subDef = subclassificacoes.find(s => s.id_suffix === suffix);
              const data = variationData[suffix];
              if (!subDef || !data) return null;

              return (
                <motion.div
                  key={suffix}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card className="border-2 border-green-100 shadow-md bg-white rounded-[24px] overflow-hidden">
                    <CardHeader className="bg-green-50/50 border-b border-green-100 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-lg text-slate-900">{produtoSelecionado?.nome_exibicao}</h3>
                        <Badge variant="secondary" className="bg-green-200 text-green-900 font-black px-3 py-1">
                          {subDef.nome}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                      
                      {/* Photo Capture */}
                      <div className="space-y-2">
                        <Label className="text-slate-500 font-bold text-xs uppercase tracking-wider">Foto do Lote (Obrigatório)</Label>
                        {data.photo ? (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200">
                            <img src={data.photo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
                              onClick={() => {
                                updateVariationData(suffix, 'photo', '');
                                updateVariationData(suffix, 'aiResult', null);
                              }}
                            >
                              Trocar Foto
                            </Button>
                          </div>
                        ) : (
                          <PhotoSourcePicker onImageCaptured={(base64) => {
                            updateVariationData(suffix, 'photo', base64);
                            handleAiClassificationVariation(suffix, base64);
                          }} />
                        )}
                      </div>

                      {data.isAnalyzing && (
                        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                          <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                          <p className="text-sm font-bold text-green-700">IA analisando qualidade...</p>
                        </div>
                      )}

                      {data.aiResult && !data.isAnalyzing && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                              <h3 className="text-white font-bold text-xs uppercase tracking-widest">Identificação IA</h3>
                            </div>
                            <Badge className="bg-green-500 text-white border-none text-[10px]">
                              {data.aiResult.confianca_identificacao}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Variedade</p>
                              <p className="text-white text-xs font-bold">{data.aiResult.variedade}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Classificação</p>
                              <p className="text-white text-xs font-bold">{data.aiResult.classificacao_comercial}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Price Input */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-500 font-bold text-xs uppercase tracking-wider">Preço por {produtoSelecionado?.unidade_medida}</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">R$</span>
                            <Input 
                              type="text" 
                              inputMode="numeric"
                              value={data.price}
                              onChange={(e) => updateVariationData(suffix, 'price', formatToBRL(e.target.value))}
                              placeholder="0,00"
                              className="h-16 pl-12 text-2xl font-black text-slate-900 rounded-xl border-slate-200 focus-visible:ring-green-500 bg-slate-50"
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={() => {
                            if (!data.price || !data.photo) {
                              toast.error('Preencha o preço e tire uma foto para salvar.');
                              return;
                            }
                            // Call handleBatchSubmit but only for this variation
                            // Actually, it's easier to just call handleBatchSubmit and it will handle selectedVariations
                            // But if we want to save ONLY this one, we should temporarily filter selectedVariations
                            const originalSelected = [...selectedVariations];
                            setSelectedVariations([suffix]);
                            setTimeout(() => {
                              handleBatchSubmit();
                              // After submit, the form is reset, so we don't need to restore originalSelected
                            }, 0);
                          }}
                          disabled={isSubmitting}
                          className={`w-full h-12 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] ${
                            isFormSaved 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isSubmitting ? 'Salvando...' : (isFormSaved ? 'SALVO' : 'Salvar este Lote')}
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Sticky Bottom Action for Batch Submit */}
          <AnimatePresence>
            {(selectedVariations.length > 0 || isCustomProduct) && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
              >
                <div className="max-w-2xl mx-auto">
                  <Button 
                    className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xl shadow-xl shadow-green-200 transition-all active:scale-[0.98]"
                    onClick={handleBatchSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Publicando...' : (isCustomProduct ? 'Publicar Novo Produto' : `Publicar ${selectedVariations.length} ${selectedVariations.length === 1 ? 'Produto' : 'Produtos'}`)}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Pedidos Recebidos</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
              {getOrdersByStall(id || '').length} Pedidos
            </Badge>
          </div>

          {getOrdersByStall(id || '').length === 0 ? (
            <Card className="border-none shadow-sm bg-white rounded-[32px] p-12 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum pedido recebido ainda.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {getOrdersByStall(id || '').map(order => (
                <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <FeedbackView stallId={sellerStallId} />
      )}

      {/* Quick Edit Modal (Daily Focus) */}
      <AnimatePresence>
        {editingItem && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 flex flex-col md:p-6 md:items-center md:justify-center md:bg-slate-900/40"
          >
            <div className="bg-slate-50 md:bg-white w-full h-full md:h-auto md:max-w-md md:rounded-[32px] md:shadow-2xl flex flex-col overflow-hidden relative">
              
              {/* Header */}
              <div className="bg-white p-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
                <div>
                  <h2 className="font-black text-lg text-slate-900 leading-tight">{editingItem.product.nome_exibicao}</h2>
                  <p className="text-sm font-bold text-green-600">{editingItem.product.subclassificacao || 'Padrão'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)} className="h-12 w-12 bg-slate-100 rounded-full flex-shrink-0">
                  <XCircle className="w-6 h-6 text-slate-500" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                <DailyUpdateForm item={editingItem} onSave={handleSaveEdit} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeedbackView({ stallId }: { stallId: string }) {
  const { orders } = useOrders();
  const feedbackOrders = orders.filter(o => o.stallId === stallId && o.qualityFeedback);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Feedback de Qualidade</h2>
        <Badge className="bg-blue-100 text-blue-700 border-none px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest">
          {feedbackOrders.length} Avaliações
        </Badge>
      </div>

      {feedbackOrders.length > 0 ? (
        <div className="space-y-4">
          {feedbackOrders.map((order) => (
            <Card key={order.id} className="border-none shadow-md bg-white rounded-[32px] overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {order.buyerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{order.buyerName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Pedido #{order.id.replace('ORD-', '')} • {new Date(order.qualityFeedback!.submittedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge className={`
                    ${order.qualityFeedback!.rating === 'bom' ? 'bg-green-600' : 
                      order.qualityFeedback!.rating === 'regular' ? 'bg-yellow-500' : 'bg-red-500'} 
                    text-white border-none px-4 py-1 rounded-full font-black uppercase text-[10px]
                  `}>
                    {order.qualityFeedback!.rating}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(order.qualityFeedback!.checklist).map(([key, value]) => (
                    <div key={key} className={`flex items-center gap-2 p-2 rounded-xl border ${value ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {value ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{key}</span>
                    </div>
                  ))}
                </div>

                {order.qualityFeedback!.comments && (
                  <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    "{order.qualityFeedback!.comments}"
                  </p>
                )}

                <div className="pt-2 border-t border-slate-50">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Itens Avaliados:</p>
                   <div className="flex flex-wrap gap-2">
                     {order.items.map((item, idx) => (
                       <Badge key={idx} variant="outline" className="text-[10px] border-slate-200 text-slate-500">
                         {item.name} ({item.subclassification})
                       </Badge>
                     ))}
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Nenhum feedback ainda</h2>
          <p className="text-slate-500 mt-2">As avaliações dos compradores aparecerão aqui.</p>
        </div>
      )}
    </div>
  );
}

const StockItemCard: React.FC<{ item: any, onSave: (item: any) => void, onEditFull: () => void }> = ({ item, onSave, onEditFull }) => {
  const [price, setPrice] = useState(formatToBRL(item.price));
  const [isAvailable, setIsAvailable] = useState(item.stock > 0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setPrice(formatToBRL(item.price));
    setIsAvailable(item.stock > 0);
    setIsSaved(item.isSaved || false);
  }, [item]);

  const handleSave = async () => {
    const updatedItem = {
      ...item,
      price: parseBRL(price),
      stock: isAvailable ? (item.stock > 0 ? item.stock : 100) : 0,
      updatedAt: new Date().toISOString(),
      isSaved: true
    };
    await onSave(updatedItem);
    setIsSaved(true);
    toast.success(`Preço de ${item.product.nome_exibicao} atualizado!`);
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[24px]">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail with Date Stamp */}
          <div 
            className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100 shadow-inner cursor-pointer"
            onClick={onEditFull}
          >
            <img src={item.product.image} alt={item.product.nome_exibicao} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3 text-white/90" />
              <span className="text-[10px] font-bold text-white tracking-wider">{item.photoDate}</span>
            </div>
          </div>

          {/* Info & Actions */}
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 font-black text-xs px-2.5 py-0.5 border border-green-200">
                    {item.product.subclassificacao || 'Padrão'}
                  </Badge>
                  {item.isDailyOffer && (
                    <Badge className="bg-orange-500 text-white font-black text-[10px] px-2 py-0.5 border-none animate-pulse">
                      <Zap className="w-3 h-3 mr-1 fill-current" />
                      OFERTA
                    </Badge>
                  )}
                </div>
                <button 
                  onClick={() => {
                  setIsAvailable(!isAvailable);
                  setIsSaved(false);
                }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${isAvailable ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  {isAvailable ? <Check className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Preço Hoje (R$):</p>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  type="text" 
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => {
                    setPrice(formatToBRL(e.target.value));
                    setIsSaved(false);
                  }}
                  disabled={!isAvailable}
                  className="h-10 text-lg font-black text-slate-900 rounded-lg border-slate-200 focus-visible:ring-green-500 disabled:bg-slate-50 disabled:text-slate-400 w-24 px-2"
                />
                <span className="text-xs text-slate-400 font-normal leading-tight">/ {item.product.unidade_medida}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex gap-2">
                <Button 
                  onClick={onEditFull}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl text-slate-600 font-bold border-slate-200"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleSave}
                  className={`flex-[3] h-10 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] ${
                    isSaved 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSaved ? 'SALVO' : 'Salvar'}
                </Button>
              </div>
              <Button 
                onClick={onEditFull}
                className={`w-full h-10 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all ${
                  item.isDailyOffer 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100' 
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-green-100'
                }`}
              >
                <Zap className="w-4 h-4 mr-2 fill-current" />
                {item.isDailyOffer ? 'OFERTA DO DIA ATIVA' : 'ATIVAR OFERTA DO DIA'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DailyUpdateForm({ item, onSave }: { item: any, onSave: (item: any) => void }) {
  const [isAvailable, setIsAvailable] = useState(item.stock > 0);
  const [isDailyOffer, setIsDailyOffer] = useState(item.isDailyOffer || false);
  const [price, setPrice] = useState<string>(formatToBRL(item.price));
  const [dailyOfferPrice, setDailyOfferPrice] = useState<string>(formatToBRL(item.dailyOfferPrice || item.price * 0.9));
  const [photoPreview, setPhotoPreview] = useState<string>(item.product.image);
  const [isSaved, setIsSaved] = useState(item.isSaved || false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<ClassificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const handleAiClassification = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const result = await classifyProductImage(base64);
      if (result) {
        setAiResult(result);
        toast.success('Identificação automática concluída!');
      }
    } catch (error) {
      console.error('AI Classification error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const adjustPrice = (amount: number) => {
    const currentPrice = parseBRL(price);
    const newPrice = Math.max(0, currentPrice + amount);
    setPrice(formatToBRL(newPrice));
    setIsSaved(false);
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file);
        setPhotoPreview(base64);
        setIsSaved(false);
      } catch (error) {
        console.error('Error processing daily photo:', error);
        toast.error('Erro ao processar imagem.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Daily Photo */}
      <div className="space-y-3">
        <Label className="text-slate-500 font-bold uppercase tracking-widest text-xs">1. Foto do Lote do Dia (Obrigatório)</Label>
        
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            
            {/* Simulated Date Stamp Overlay */}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/20">
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white tracking-wider">Lote de hoje - {todayStr}</span>
            </div>
          </div>
          
          <PhotoSourcePicker onImageCaptured={(base64) => {
            setPhotoPreview(base64);
            setIsSaved(false);
            handleAiClassification(base64);
          }} />
        </div>
      </div>

      {/* AI Classification Result */}
      {isAnalyzing && (
        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
          <p className="text-sm font-bold text-green-700">IA analisando qualidade e variedade do lote...</p>
        </div>
      )}

      {aiResult && !isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-3xl shadow-xl border border-slate-700 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-black text-sm uppercase tracking-widest">Identificação IA</h3>
            </div>
            <Badge className="bg-green-500 text-white border-none font-bold">
              {aiResult.confianca_identificacao} Confiança
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Produto</p>
              <p className="text-white font-bold">{aiResult.produto_principal}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Variedade</p>
              <p className="text-white font-bold">{aiResult.variedade}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Classificação</p>
              <p className="text-white font-bold">{aiResult.classificacao_comercial}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Obs. Visuais</p>
              <p className="text-white text-xs leading-tight">{aiResult.observacoes_visuais}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 2: Daily Price */}
      <div className={`space-y-3 transition-all duration-300 ${!isAvailable ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <Label className="text-slate-500 font-bold uppercase tracking-widest text-xs">2. Preço Diário ({item.product.unidade_medida})</Label>
        
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl">R$</span>
            <Input 
              type="text" 
              inputMode="numeric"
              value={price}
              onChange={(e) => {
                setPrice(formatToBRL(e.target.value));
                setIsSaved(false);
              }}
              disabled={!isAvailable}
              className="h-20 pl-14 text-4xl font-black text-slate-900 rounded-2xl border-slate-200 focus-visible:ring-green-500 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="flex justify-between items-center px-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-800 flex items-center gap-2">
              <Store className="w-4 h-4" />
              Média de mercado ontem: <span className="text-blue-900 text-sm">R$ {item.marketAverage.toFixed(2)}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Button type="button" disabled={!isAvailable} variant="outline" className="h-14 bg-slate-50 text-slate-600 font-black text-lg rounded-xl" onClick={() => adjustPrice(-1)}>-1</Button>
            <Button type="button" disabled={!isAvailable} variant="outline" className="h-14 bg-slate-50 text-slate-600 font-black text-lg rounded-xl" onClick={() => adjustPrice(-0.5)}>-0.5</Button>
            <Button type="button" disabled={!isAvailable} variant="outline" className="h-14 bg-slate-50 text-slate-600 font-black text-lg rounded-xl" onClick={() => adjustPrice(0.5)}>+0.5</Button>
            <Button type="button" disabled={!isAvailable} variant="outline" className="h-14 bg-slate-50 text-slate-600 font-black text-lg rounded-xl" onClick={() => adjustPrice(1)}>+1</Button>
          </div>
        </div>
      </div>

      {/* Section 3: Daily Offer */}
      <div className="space-y-3">
        <Label className="text-slate-500 font-bold uppercase tracking-widest text-xs">3. Oferta do Dia</Label>
        <div 
          className={`relative flex flex-col p-5 rounded-3xl cursor-pointer transition-all border-2 shadow-sm ${isDailyOffer ? 'bg-orange-50 border-orange-500' : 'bg-slate-100 border-slate-200'}`}
          onClick={() => {
            setIsDailyOffer(!isDailyOffer);
            setIsSaved(false);
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDailyOffer ? 'bg-orange-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className={`font-black text-xl ${isDailyOffer ? 'text-orange-800' : 'text-slate-600'}`}>
                  {isDailyOffer ? 'Oferta Ativa' : 'Ativar Oferta'}
                </p>
                <p className={`text-sm font-medium ${isDailyOffer ? 'text-orange-600/80' : 'text-slate-500'}`}>
                  {isDailyOffer ? 'Destaque especial no app' : 'Sem destaque de oferta'}
                </p>
              </div>
            </div>
            
            <div className={`w-16 h-10 rounded-full p-1 transition-colors ${isDailyOffer ? 'bg-orange-500' : 'bg-slate-300'}`}>
              <motion.div 
                className="w-8 h-8 bg-white rounded-full shadow-md"
                animate={{ x: isDailyOffer ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </div>

          {isDailyOffer && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-orange-200 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Label className="text-orange-700 font-bold text-sm">Preço da Oferta (R$)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-xl">R$</span>
                <Input 
                  type="text" 
                  inputMode="numeric"
                  value={dailyOfferPrice}
                  onChange={(e) => {
                    setDailyOfferPrice(formatToBRL(e.target.value));
                    setIsSaved(false);
                  }}
                  className="h-14 pl-12 text-2xl font-black text-orange-900 rounded-xl border-orange-200 bg-white focus-visible:ring-orange-500"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Section 4: Availability Toggle */}
      <div className="space-y-3">
        <Label className="text-slate-500 font-bold uppercase tracking-widest text-xs">4. Disponibilidade</Label>
        <div 
          className={`relative flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 shadow-sm ${isAvailable ? 'bg-green-50 border-green-500' : 'bg-slate-100 border-slate-200'}`}
          onClick={() => {
            setIsAvailable(!isAvailable);
            setIsSaved(false);
          }}
        >
          <div className="flex items-center gap-4">
            {isAvailable ? <CheckCircle2 className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-slate-400" />}
            <div>
              <p className={`font-black text-xl ${isAvailable ? 'text-green-800' : 'text-slate-600'}`}>
                {isAvailable ? 'Disponível' : 'Esgotado'}
              </p>
              <p className={`text-sm font-medium ${isAvailable ? 'text-green-600/80' : 'text-slate-500'}`}>
                {isAvailable ? 'Visível no catálogo' : 'Oculto para compradores'}
              </p>
            </div>
          </div>
          
          {/* Custom Giant Switch */}
          <div className={`w-20 h-12 rounded-full p-1.5 transition-colors ${isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}>
            <motion.div 
              className="w-9 h-9 bg-white rounded-full shadow-md"
              animate={{ x: isAvailable ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 md:absolute md:rounded-b-[32px] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Button 
          className={`w-full h-16 rounded-2xl text-white font-black text-xl shadow-xl transition-all active:scale-[0.98] ${
            isSaved 
              ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' 
              : 'bg-green-600 hover:bg-green-700 shadow-green-200'
          }`}
          onClick={() => {
            const updatedItem = {
              ...item,
              price: parseBRL(price),
              isDailyOffer,
              dailyOfferPrice: isDailyOffer ? parseBRL(dailyOfferPrice) : null,
              stock: isAvailable ? (item.stock > 0 ? item.stock : 100) : 0,
              product: {
                ...item.product,
                image: photoPreview
              },
              photoDate: todayStr,
              isSaved: true
            };
            onSave(updatedItem);
            setIsSaved(true);
          }}
        >
          {isSaved ? 'SALVO' : 'Publicar Lote do Dia'}
        </Button>
      </div>
    </div>
  );
}

const OrderCard: React.FC<{ order: Order, onUpdateStatus: (id: string, status: Order['status']) => Promise<void> }> = ({ order, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusMap = {
    pending: { label: 'Pendente', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  const handleConfirmDelivery = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, 'delivered');
      toast.success('Pedido marcado como entregue!');
    } catch (error) {
      toast.error('Erro ao atualizar pedido.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNextStatus = async () => {
    const statusOrder: Order['status'][] = ['pending', 'preparing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    if (currentIndex < statusOrder.length - 1) {
      setIsUpdating(true);
      try {
        await onUpdateStatus(order.id, statusOrder[currentIndex + 1]);
        toast.success(`Status atualizado para ${statusMap[statusOrder[currentIndex + 1]].label}`);
      } catch (error) {
        toast.error('Erro ao atualizar status.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[32px] border border-slate-100">
      <CardHeader className="p-5 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-black text-slate-900 text-lg leading-tight">{order.buyerName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <p className="text-xs font-bold text-slate-500">{order.buyerPhone}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-10 w-10 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
            onClick={() => {
              const phone = order.buyerPhone.replace(/\D/g, '');
              window.open(`https://wa.me/55${phone}`, '_blank');
            }}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Badge className={`${statusMap[order.status].color} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border`}>
            {statusMap[order.status].label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        {/* Buyer Info & Delivery Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <User className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dados do Comprador</p>
              <p className="text-sm font-bold text-slate-700">{order.buyerName}</p>
              <p className="text-xs text-slate-500 font-medium">{order.buyerPhone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
            <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Local de Entrega</p>
              <p className="text-sm font-bold text-slate-700">{order.address || 'Pavilhão Central, Box 00'}</p>
            </div>
          </div>
        </div>

        {/* Order Steps Timeline */}
        <div className="relative">
          <div className="flex items-center justify-between px-2 relative z-10">
            {[
              { id: 'pending', icon: Clock, label: 'Pendente' },
              { id: 'preparing', icon: Package, label: 'Preparando' },
              { id: 'shipped', icon: Truck, label: 'Enviado' },
              { id: 'delivered', icon: CheckCircle2, label: 'Entregue' }
            ].map((step, idx, arr) => {
              const isCompleted = arr.findIndex(s => s.id === order.status) >= idx;
              const isCurrent = order.status === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 flex-1 relative">
                  {/* Connector Line */}
                  {idx < arr.length - 1 && (
                    <div className={`absolute left-1/2 right-[-50%] top-4 h-1 z-[-1] ${isCompleted && arr.findIndex(s => s.id === order.status) > idx ? 'bg-green-500' : 'bg-slate-100'}`} />
                  )}
                  
                  <motion.div 
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${
                      isCompleted ? 'bg-green-600 text-white shadow-green-100' : 'bg-slate-100 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                  >
                    <step.icon className="w-5 h-5" />
                  </motion.div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter text-center ${isCompleted ? 'text-green-700' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Itens do Pedido</p>
          <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Package className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{item.quantity}x</span>
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.subclassification}</span>
                  </div>
                </div>
                <span className="font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</span>
              <span className="text-lg font-black text-green-600">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-3">
          {order.status !== 'delivered' && order.status !== 'cancelled' ? (
            <div className="flex gap-3">
              {order.status !== 'shipped' && (
                <Button 
                  onClick={handleNextStatus}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl h-14 hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Próximo Passo'}
                </Button>
              )}
              <Button 
                onClick={handleConfirmDelivery}
                disabled={isUpdating}
                className="flex-[1.5] bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl h-14 shadow-xl shadow-green-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirmar Entrega
                  </>
                )}
              </Button>
            </div>
          ) : order.status === 'delivered' ? (
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <p className="font-black text-orange-700 text-sm uppercase tracking-widest">Pedido Entregue com Sucesso</p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="font-black text-red-700 text-sm uppercase tracking-widest">Pedido Cancelado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
