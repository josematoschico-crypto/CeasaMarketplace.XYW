import { Product, Stall, StallProduct, Order } from "../types";

export const PRODUCTS: Product[] = [
  { id: 'PROD_TOMATE_ITA_EXTRA', grupo_base: 'tomate_italiano', nome_exibicao: 'Tomate Italiano', subclassificacao: 'Extra', categoria: 'Legumes', unidade_medida: 'Caixa 20kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_TOMATE_ITA_A', grupo_base: 'tomate_italiano', nome_exibicao: 'Tomate Italiano', subclassificacao: 'Tipo A', categoria: 'Legumes', unidade_medida: 'Caixa 20kg', image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_BANANA_NANICA_1', grupo_base: 'banana_nanica', nome_exibicao: 'Banana Nanica', subclassificacao: 'Primeira', categoria: 'Frutas', unidade_medida: 'Caixa 18kg', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_ALFACE_CRESPA_G', grupo_base: 'alface_crespa', nome_exibicao: 'Alface Crespa', subclassificacao: 'Grande', categoria: 'Verduras', unidade_medida: 'Maço', image: 'https://images.unsplash.com/photo-1622206141580-579f30d7603a?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_BATATA_MONA_A', grupo_base: 'batata_monalisa', nome_exibicao: 'Batata Monalisa', subclassificacao: 'Tipo A', categoria: 'Legumes', unidade_medida: 'Saco 50kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_BATATA_MONA_AA', grupo_base: 'batata_monalisa', nome_exibicao: 'Batata Monalisa', subclassificacao: 'Tipo AA', categoria: 'Legumes', unidade_medida: 'Saco 50kg', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_BATATA_MONA_LAVADA', grupo_base: 'batata_monalisa', nome_exibicao: 'Batata Monalisa', subclassificacao: 'Lavada', categoria: 'Legumes', unidade_medida: 'Saco 50kg', image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_CEBOLA_NAC_GRAUDA', grupo_base: 'cebola_nacional', nome_exibicao: 'Cebola Nacional', subclassificacao: 'Graúda', categoria: 'Legumes', unidade_medida: 'Saco 20kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_MACA_GALA_100', grupo_base: 'maca_gala', nome_exibicao: 'Maçã Gala', subclassificacao: 'Calibre 100', categoria: 'Frutas', unidade_medida: 'Caixa 18kg', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_OVO_BRANCO_G', grupo_base: 'ovo_branco', nome_exibicao: 'Ovo Branco', subclassificacao: 'Grande', categoria: 'Ovos', unidade_medida: 'Caixa 30 dúzias', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_FEIJAO_CARIOCA_N1', grupo_base: 'feijao_carioca', nome_exibicao: 'Feijão Carioca', subclassificacao: 'Nota 1', categoria: 'Grãos', unidade_medida: 'Saco 60kg', image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_PIMENTA_DEDO_MOCA', grupo_base: 'pimenta_dedo_moca', nome_exibicao: 'Pimenta Dedo de Moça', subclassificacao: 'Extra', categoria: 'Temperos', unidade_medida: 'Kg', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_MANGA_PALMER_G', grupo_base: 'manga_palmer', nome_exibicao: 'Manga Palmer', subclassificacao: 'Grande', categoria: 'Frutas', unidade_medida: 'Caixa 20kg', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_CENOURA_G', grupo_base: 'cenoura', nome_exibicao: 'Cenoura', subclassificacao: 'Grande', categoria: 'Legumes', unidade_medida: 'Caixa 20kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_ABACATE_BRED', grupo_base: 'abacate', nome_exibicao: 'Abacate', subclassificacao: 'Breda', categoria: 'Frutas', unidade_medida: 'Caixa 20kg', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_ABACAXI_PERO', grupo_base: 'abacaxi', nome_exibicao: 'Abacaxi', subclassificacao: 'Pérola', categoria: 'Frutas', unidade_medida: 'Unidade', image: 'https://images.unsplash.com/photo-1550258114-b09a88c8415d?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_LIMAO_TAHI', grupo_base: 'limao', nome_exibicao: 'Limão', subclassificacao: 'Tahiti', categoria: 'Frutas', unidade_medida: 'Saco 20kg', image: 'https://images.unsplash.com/photo-1590505681531-f17c6c7046f2?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_MELANCIA_GRAU', grupo_base: 'melancia', nome_exibicao: 'Melancia', subclassificacao: 'Graúda', categoria: 'Frutas', unidade_medida: 'Kg', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_MORANGO_EXTR', grupo_base: 'morango', nome_exibicao: 'Morango', subclassificacao: 'Extra', categoria: 'Frutas', unidade_medida: 'Bandeja 250g', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_UVA_NIAG', grupo_base: 'uva', nome_exibicao: 'Uva', subclassificacao: 'Niágara', categoria: 'Frutas', unidade_medida: 'Caixa 8kg', image: 'https://images.unsplash.com/photo-1533418264835-98fe1e30c64e?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_ABOBORA_CABA', grupo_base: 'abobora', nome_exibicao: 'Abóbora', subclassificacao: 'Cabotiá', categoria: 'Legumes', unidade_medida: 'Saco 20kg', image: 'https://images.unsplash.com/photo-1506807803488-8eafc15537a6?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_BERINJELA_EXTR', grupo_base: 'berinjela', nome_exibicao: 'Berinjela', subclassificacao: 'Extra', categoria: 'Legumes', unidade_medida: 'Caixa 15kg', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_BROCOLIS_NINJ', grupo_base: 'brocolis', nome_exibicao: 'Brócolis', subclassificacao: 'Ninja', categoria: 'Verduras', unidade_medida: 'Caixa 10kg', image: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?auto=format&fit=crop&q=80&w=800' },
  { id: 'PROD_COUVE_MANT', grupo_base: 'couve', nome_exibicao: 'Couve', subclassificacao: 'Manteiga', categoria: 'Verduras', unidade_medida: 'Maço', image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=800' },
];

export const STALLS: Stall[] = [
  { id: 's2', name: 'Frutas Selecionadas Silva', ownerId: 'u3', location: 'Pavilhão B, Box 12', rating: 4.5, image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800', isNew: true },
  { id: 's3', name: 'Verduras Frescas Cia', ownerId: 'u4', location: 'Pavilhão C, Box 01', rating: 4.9, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800' },
  { id: 's4', name: 'Ovos do Campo', ownerId: 'u5', location: 'Pavilhão D, Box 08', rating: 4.7, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800' },
  { id: 's5', name: 'Grãos & Cia', ownerId: 'u6', location: 'Pavilhão E, Box 15', rating: 4.6, image: 'https://images.unsplash.com/photo-1515544824820-623728527ff7?auto=format&fit=crop&q=80&w=800', isNew: true },
  { id: 's6', name: 'Temperos da Terra', ownerId: 'u7', location: 'Pavilhão F, Box 20', rating: 4.9, image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&q=80&w=800', isNew: true },
  { id: 's7', name: 'Distribuidora Central', ownerId: 'u8', location: 'Pavilhão G, Box 30', rating: 4.4, image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800' },
  { id: 's8', name: 'Sítio Primavera', ownerId: 'u9', location: 'Pavilhão H, Box 02', rating: 5.0, image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800', isNew: true },
];

export const STALL_PRODUCTS: StallProduct[] = [
  { id: 'sp3', stallId: 's2', productId: 'PROD_BANANA_NANICA_1', price: 35.00, stock: 100, updatedAt: new Date().toISOString() },
  { id: 'sp4', stallId: 's2', productId: 'PROD_MACA_GALA_100', price: 120.00, stock: 20, updatedAt: new Date().toISOString() },
  { id: 'sp4_2', stallId: 's2', productId: 'PROD_MANGA_PALMER_G', price: 65.00, stock: 45, updatedAt: new Date().toISOString() },
  { id: 'sp4_3', stallId: 's2', productId: 'PROD_ABACATE_BRED', price: 55.00, stock: 30, updatedAt: new Date().toISOString() },
  { id: 'sp4_4', stallId: 's2', productId: 'PROD_ABACAXI_PERO', price: 8.50, stock: 60, updatedAt: new Date().toISOString() },
  { id: 'sp5', stallId: 's3', productId: 'PROD_ALFACE_CRESPA_G', price: 2.50, stock: 200, updatedAt: new Date().toISOString() },
  { id: 'sp5_2', stallId: 's3', productId: 'PROD_BROCOLIS_NINJ', price: 45.00, stock: 40, updatedAt: new Date().toISOString() },
  { id: 'sp5_3', stallId: 's3', productId: 'PROD_COUVE_MANT', price: 3.50, stock: 150, updatedAt: new Date().toISOString() },
  { id: 'sp6_2', stallId: 's3', productId: 'PROD_CEBOLA_NAC_GRAUDA', price: 80.00, stock: 60, updatedAt: new Date().toISOString() },
  { id: 'sp7', stallId: 's4', productId: 'PROD_OVO_BRANCO_G', price: 165.00, stock: 50, updatedAt: new Date().toISOString() },
  { id: 'sp8', stallId: 's5', productId: 'PROD_FEIJAO_CARIOCA_N1', price: 280.00, stock: 30, updatedAt: new Date().toISOString() },
  { id: 'sp9', stallId: 's6', productId: 'PROD_PIMENTA_DEDO_MOCA', price: 12.00, stock: 100, updatedAt: new Date().toISOString() },
  { id: 'sp10', stallId: 's7', productId: 'PROD_CENOURA_G', price: 55.00, stock: 80, updatedAt: new Date().toISOString() },
  { id: 'sp10_2', stallId: 's7', productId: 'PROD_ABOBORA_CABA', price: 42.00, stock: 60, updatedAt: new Date().toISOString() },
  { id: 'sp10_3', stallId: 's7', productId: 'PROD_BERINJELA_EXTR', price: 38.00, stock: 40, updatedAt: new Date().toISOString() },
  { id: 'sp11', stallId: 's8', productId: 'PROD_ALFACE_CRESPA_G', price: 2.20, stock: 300, updatedAt: new Date().toISOString() },
  { id: 'sp11_2', stallId: 's8', productId: 'PROD_MORANGO_EXTR', price: 6.50, stock: 100, updatedAt: new Date().toISOString() },
  { id: 'sp11_3', stallId: 's8', productId: 'PROD_UVA_NIAG', price: 65.00, stock: 50, updatedAt: new Date().toISOString() },
];

export const MOCK_DRIVERS = [
  {
    name: 'Ricardo Primo',
    truck: 'Caminhão HR - ABC-1234',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', // White male, light eyes, beard
    phone: '11999999999',
  },
  {
    name: 'João Pedro',
    truck: 'Fiorino Branca - XYZ-9876',
    photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200',
    phone: '11988888888',
  },
  {
    name: 'Carlos Mendes',
    truck: 'Van Renault - DEF-5678',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    phone: '11977777777',
  },
  {
    name: 'Marcos Souza',
    truck: 'Kombi Branca - GHI-9012',
    photo: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=200',
    phone: '11966666666',
  }
];

export const MOCK_SELLERS = [
  {
    whatsapp: '11888888888',
    password: '456',
    name: 'Antônio Silva',
    barracaId: 's2', // Frutas Selecionadas Silva
  },
  {
    whatsapp: '11777777777',
    password: '789',
    name: 'Maria Santos',
    barracaId: 's3', // Verduras Frescas Cia
  }
];

export const MOCK_BUYERS = [
  {
    whatsapp: '11111111111',
    password: '123',
    name: 'Carlos Oliveira',
    id: 'b1',
  }
];
