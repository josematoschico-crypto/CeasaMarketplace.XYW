import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Bell, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="relative p-8 text-center space-y-6">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <UserPlus className="w-10 h-10 text-green-600" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Quase lá! 🚀</h2>
                <p className="text-slate-500">
                  Inscreva-se ou cadastre-se para comprar e receber as melhores ofertas do dia direto no seu WhatsApp!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <Bell className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Alertas de ofertas exclusivas</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Histórico de preços em tempo real</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Compra rápida e segura</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link to="/cadastro-comprador" onClick={onClose} className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Cadastrar como Comprador
                  </Button>
                </Link>
                <Link to="/painel-comprador" onClick={onClose} className="w-full">
                  <Button variant="outline" className="w-full h-12 rounded-2xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50">
                    Já tenho conta (Entrar)
                  </Button>
                </Link>
                <div className="pt-2">
                  <Link to="/cadastro-vendedor" onClick={onClose} className="text-xs text-slate-400 hover:text-green-600 transition-colors">
                    É um produtor? Cadastre sua barraca aqui
                  </Link>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="text-slate-400 font-medium text-sm"
                >
                  Continuar como visitante
                </Button>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 text-center border-t border-green-100">
              <p className="text-xs text-green-700 font-medium">
                Junte-se a mais de 500 compradores no CEASA Market
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
