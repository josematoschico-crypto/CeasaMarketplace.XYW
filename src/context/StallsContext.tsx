import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Stall, StallProduct } from '../types/index';
import { STALLS as MOCK_STALLS, STALL_PRODUCTS as MOCK_STALL_PRODUCTS } from '../data/mock';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

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

interface StallsContextType {
  stalls: Stall[];
  stallProducts: StallProduct[];
  addStall: (newStall: Stall) => Promise<void>;
  updateStall: (updatedStall: Stall) => Promise<void>;
  addStallProduct: (newProduct: StallProduct) => Promise<void>;
  updateStallProduct: (updatedProduct: StallProduct) => Promise<void>;
  batchUpdateStallProducts: (products: StallProduct[]) => Promise<void>;
  setStallProductsForStall: (stallId: string, products: StallProduct[]) => void;
}

const StallsContext = createContext<StallsContextType | undefined>(undefined);

export function StallsProvider({ children }: { children: ReactNode }) {
  const [rawStalls, setRawStalls] = useState<Stall[]>([]);
  const [rawStallProducts, setRawStallProducts] = useState<StallProduct[]>([]);

  const excludedNames = ['TEXTÃO', 'HORTI FRUTI', 'JOTA', 'HORTIFRUTI DO ZÉ', 'HOS', 'QUAL', 'HAS', '13', 'TEX', 'UMDOIS', 'VAAAMO'];

  const stalls = React.useMemo(() => {
    return rawStalls.filter(stall => 
      !excludedNames.some(name => stall.name.toUpperCase().includes(name))
    );
  }, [rawStalls]);

  const stallProducts = React.useMemo(() => {
    const excludedStallIds = rawStalls
      .filter(stall => excludedNames.some(name => stall.name.toUpperCase().includes(name)))
      .map(s => s.id);
    
    return rawStallProducts.filter(p => !excludedStallIds.includes(p.stallId));
  }, [rawStallProducts, rawStalls]);

  useEffect(() => {
    const unsubscribeStalls = onSnapshot(collection(db, 'stalls'), (snapshot) => {
      const stallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stall));
      
      // Merge real data with mock data, prioritizing real data
      const mergedStalls = [...stallsData];
      MOCK_STALLS.forEach(mockStall => {
        if (!mergedStalls.some(s => s.id === mockStall.id)) {
          mergedStalls.push(mockStall);
        }
      });
      
      setRawStalls(mergedStalls);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'stalls');
    });

    const unsubscribeProducts = onSnapshot(collection(db, 'stallProducts'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StallProduct));
      
      // Merge real data with mock data, prioritizing real data
      const mergedProducts = [...productsData];
      MOCK_STALL_PRODUCTS.forEach(mockProduct => {
        if (!mergedProducts.some(p => p.id === mockProduct.id)) {
          mergedProducts.push(mockProduct);
        }
      });
      
      setRawStallProducts(mergedProducts);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'stallProducts');
    });

    return () => {
      unsubscribeStalls();
      unsubscribeProducts();
    };
  }, []);

  const addStall = async (newStall: Stall) => {
    try {
      const sanitized = sanitizePayload(newStall);
      await setDoc(doc(db, 'stalls', newStall.id), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `stalls/${newStall.id}`);
    }
  };

  const updateStall = async (updatedStall: Stall) => {
    try {
      const sanitized = sanitizePayload(updatedStall);
      await setDoc(doc(db, 'stalls', updatedStall.id), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `stalls/${updatedStall.id}`);
    }
  };

  const addStallProduct = async (newProduct: StallProduct) => {
    try {
      const sanitized = sanitizePayload(newProduct);
      await setDoc(doc(db, 'stallProducts', newProduct.id), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `stallProducts/${newProduct.id}`);
    }
  };

  const updateStallProduct = async (updatedProduct: StallProduct) => {
    try {
      const sanitized = sanitizePayload(updatedProduct);
      await setDoc(doc(db, 'stallProducts', updatedProduct.id), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `stallProducts/${updatedProduct.id}`);
    }
  };

  const batchUpdateStallProducts = async (products: StallProduct[]) => {
    for (const product of products) {
      try {
        const sanitized = sanitizePayload(product);
        await setDoc(doc(db, 'stallProducts', product.id), sanitized);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `stallProducts/${product.id}`);
      }
    }
  };

  const setStallProductsForStall = (stallId: string, products: StallProduct[]) => {
    // This is handled by onSnapshot, but we can keep it for immediate UI update if needed
    setRawStallProducts(prev => {
      const otherStallsProducts = prev.filter(p => p.stallId !== stallId);
      return [...products, ...otherStallsProducts];
    });
  };

  return (
    <StallsContext.Provider value={{ 
      stalls, 
      stallProducts, 
      addStall, 
      updateStall,
      addStallProduct, 
      updateStallProduct,
      batchUpdateStallProducts,
      setStallProductsForStall
    }}>
      {children}
    </StallsContext.Provider>
  );
}

export function useStalls() {
  const context = useContext(StallsContext);
  if (context === undefined) {
    throw new Error('useStalls must be used within a StallsProvider');
  }
  return context;
}
