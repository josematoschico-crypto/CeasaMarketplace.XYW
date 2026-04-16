export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'driver';
  avatar?: string;
  whatsapp?: string;
  creditInfo?: {
    limit: number;
    used: number;
    status: 'pending' | 'approved' | 'rejected' | 'none';
    score?: number;
    lastAnalysis?: string;
  };
}

export interface Product {
  id: string;
  grupo_base: string;
  nome_exibicao: string;
  subclassificacao: string;
  categoria: string;
  unidade_medida: string;
  image: string;
}

export interface Stall {
  id: string;
  name: string;
  ownerId: string;
  location: string; // e.g., "Pavilhão A, Box 12"
  rating: number;
  image: string;
  isNew?: boolean;
  isActive?: boolean;
}

export interface StallProduct {
  id: string;
  stallId: string;
  productId: string;
  price: number;
  stock: number;
  updatedAt: string;
  product?: Product;
  yesterdayPrice?: number;
  marketAverage?: number;
  photoDate?: string;
  isDailyOffer?: boolean;
  dailyOfferPrice?: number;
}

export interface CartItem extends StallProduct {
  product: Product;
  stall: Stall;
  quantity: number;
}

export interface QualityFeedback {
  rating: 'bom' | 'regular' | 'ruim';
  checklist: {
    frescor: boolean;
    aparencia: boolean;
    tamanho: boolean;
    embalagem: boolean;
  };
  comments?: string;
  submittedAt: string;
}

export interface Order {
  id: string;
  stallId: string;
  stallName?: string;
  sellerId: string; // UID of the stall owner
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  date: string;
  total: number;
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  driver?: {
    name: string;
    truck: string;
    photo: string;
    phone: string;
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    unit: string;
    subclassification: string;
    image: string;
  }[];
  address?: string;
  paymentMethod?: string;
  qualityFeedback?: QualityFeedback;
  logistics?: {
    id: string;
    status: 'ASSIGNING_DRIVER' | 'ON_THE_WAY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
    vehicleType: string;
    fee: string;
    handlingInstructions: string;
  };
}
