import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { MOCK_SELLERS, MOCK_BUYERS } from '../data/mock';

// Utility to remove undefined values from an object
const sanitizePayload = (obj: any) => {
  const sanitized = { ...obj };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  return sanitized;
};

interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: 'buyer' | 'seller' | 'driver';
  barracaId?: string;
  creditInfo?: {
    limit: number;
    used: number;
    status: 'pending' | 'approved' | 'rejected' | 'none';
    score?: number;
    lastAnalysis?: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (whatsapp: string, password: string) => Promise<void>;
  register: (whatsapp: string, password: string, name: string, role: 'buyer' | 'seller' | 'driver', barracaId?: string) => Promise<string>;
  updateUser: (uid: string, data: Partial<User>) => Promise<void>;
  analyzeCredit: (document: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getEmailFromWhatsapp = (whatsapp: string) => {
  const digits = whatsapp.replace(/\D/g, '');
  return `${digits}@ceasamarket.com`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            setUser(null);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (whatsapp: string, password: string) => {
    // Normalize whatsapp to digits only
    const normalizedWhatsapp = whatsapp.replace(/\D/g, '');
    
    if (!normalizedWhatsapp) {
      throw new Error('Por favor, insira um número de WhatsApp válido.');
    }

    // First check if the whatsapp exists in mock sellers
    const mockSellerByWhatsapp = MOCK_SELLERS.find(s => s.whatsapp === normalizedWhatsapp);
    
    if (mockSellerByWhatsapp) {
      // If it exists, verify password
      if (mockSellerByWhatsapp.password === password) {
        const mockUser: User = {
          id: `mock_${mockSellerByWhatsapp.barracaId}`,
          name: mockSellerByWhatsapp.name,
          email: `${normalizedWhatsapp}@mock.com`,
          whatsapp: normalizedWhatsapp,
          role: 'seller',
          barracaId: mockSellerByWhatsapp.barracaId
        };
        setUser(mockUser);
        return;
      } else {
        throw new Error('Senha incorreta para esta conta de demonstração.');
      }
    }

    // Check if the whatsapp exists in mock buyers
    const mockBuyerByWhatsapp = MOCK_BUYERS.find(b => b.whatsapp === normalizedWhatsapp);
    
    if (mockBuyerByWhatsapp) {
      // If it exists, verify password
      if (mockBuyerByWhatsapp.password === password) {
        const mockUser: User = {
          id: mockBuyerByWhatsapp.id,
          name: mockBuyerByWhatsapp.name,
          email: `${normalizedWhatsapp}@mock.com`,
          whatsapp: normalizedWhatsapp,
          role: 'buyer'
        };
        setUser(mockUser);
        return;
      } else {
        throw new Error('Senha incorreta para esta conta de demonstração.');
      }
    }

    // If not a mock seller, try Firebase
    const email = getEmailFromWhatsapp(normalizedWhatsapp);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Map Firebase errors to user-friendly messages
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('WhatsApp ou senha incorretos. Se você ainda não tem uma conta, por favor cadastre-se.');
      }
      throw error;
    }
  };

  const register = async (whatsapp: string, password: string, name: string, role: 'buyer' | 'seller' | 'driver', barracaId?: string) => {
    const normalizedWhatsapp = whatsapp.replace(/\D/g, '');
    const email = getEmailFromWhatsapp(normalizedWhatsapp);
    
    let firebaseUser;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este número de WhatsApp já está cadastrado. Se você já tem uma conta, por favor faça login. Caso contrário, use outro número.');
      }
      throw error;
    }
    
    const newUser: User = {
      id: firebaseUser.uid,
      name,
      email,
      whatsapp: normalizedWhatsapp,
      role,
      barracaId: barracaId || '', // Ensure it's not undefined
    };

    try {
      const sanitizedUser = sanitizePayload(newUser);
      await setDoc(doc(db, 'users', firebaseUser.uid), sanitizedUser);
      setUser(newUser);
      return firebaseUser.uid;
    } catch (error) {
      // CLEANUP: If Firestore fails, delete the Auth user to allow retry
      try {
        await firebaseUser.delete();
      } catch (deleteError) {
        console.error('Failed to cleanup auth user after firestore error:', deleteError);
      }
      
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
      throw error;
    }
  };

  const updateUser = async (uid: string, data: Partial<User>) => {
    try {
      const sanitizedData = sanitizePayload(data);
      await updateDoc(doc(db, 'users', uid), sanitizedData);
      
      // Update local state if it's the current user
      if (user && user.id === uid) {
        setUser(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const analyzeCredit = async (document: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/credit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: user.whatsapp,
          name: user.name,
          document
        })
      });

      const result = await response.json();

      if (result.success) {
        const creditInfo = {
          limit: result.limit,
          used: 0,
          status: result.status,
          score: result.score,
          lastAnalysis: result.lastAnalysis
        };

        await updateUser(user.id, { creditInfo });
      } else {
        throw new Error('Falha na análise de crédito.');
      }
    } catch (error) {
      console.error('Credit analysis error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      updateUser,
      analyzeCredit,
      logout, 
      isAuthenticated: !!user,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
