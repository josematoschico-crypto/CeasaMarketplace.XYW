export interface SubclassificationDef {
  id_suffix: string;
  nome: string;
}

export interface BaseProductDef {
  grupo_base: string;
  nome_exibicao: string;
  unidade_medida: string;
  id_prefix: string;
  subclassificacoes: SubclassificationDef[];
}

export type TaxonomyType = Record<string, Record<string, BaseProductDef>>;

export const PRODUCT_TAXONOMY: TaxonomyType = {
  "Frutas": {
    "abacate": {
      grupo_base: "abacate",
      nome_exibicao: "Abacate",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_ABACATE",
      subclassificacoes: [
        { id_suffix: "BRED", nome: "Breda" },
        { id_suffix: "FORT", nome: "Fortuna" },
        { id_suffix: "GEAD", nome: "Geada" },
        { id_suffix: "MARG", nome: "Margarida" },
        { id_suffix: "HASS", nome: "Avocado (Hass)" }
      ]
    },
    "abacaxi": {
      grupo_base: "abacaxi",
      nome_exibicao: "Abacaxi",
      unidade_medida: "Unidade",
      id_prefix: "PROD_ABACAXI",
      subclassificacoes: [
        { id_suffix: "PERO", nome: "Pérola" },
        { id_suffix: "HAVA", nome: "Havaí" }
      ]
    },
    "ameixa": {
      grupo_base: "ameixa",
      nome_exibicao: "Ameixa",
      unidade_medida: "Caixa 10kg",
      id_prefix: "PROD_AMEIXA",
      subclassificacoes: [
        { id_suffix: "NAC", nome: "Nacional" },
        { id_suffix: "IMP", nome: "Importada" }
      ]
    },
    "banana_prata": {
      grupo_base: "banana_prata",
      nome_exibicao: "Banana Prata",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_BANANA_PRATA",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" },
        { id_suffix: "PRIM", nome: "De Primeira" },
        { id_suffix: "SEGU", nome: "De Segunda" },
        { id_suffix: "CLIM", nome: "Climatizada" }
      ]
    },
    "caqui": {
      grupo_base: "caqui",
      nome_exibicao: "Caqui",
      unidade_medida: "Caixa 10kg",
      id_prefix: "PROD_CAQUI",
      subclassificacoes: [
        { id_suffix: "RAMA", nome: "Rama Forte" },
        { id_suffix: "FUYU", nome: "Fuyu" },
        { id_suffix: "TAUB", nome: "Taubaté" }
      ]
    },
    "cereja": {
      grupo_base: "cereja",
      nome_exibicao: "Cereja",
      unidade_medida: "Caixa 5kg",
      id_prefix: "PROD_CEREJA",
      subclassificacoes: [
        { id_suffix: "IMP", nome: "Importada" }
      ]
    },
    "kiwi": {
      grupo_base: "kiwi",
      nome_exibicao: "Kiwi",
      unidade_medida: "Caixa 10kg",
      id_prefix: "PROD_KIWI",
      subclassificacoes: [
        { id_suffix: "NAC", nome: "Nacional" },
        { id_suffix: "IMP", nome: "Importado" }
      ]
    },
    "laranja_pera": {
      grupo_base: "laranja_pera",
      nome_exibicao: "Laranja Pera",
      unidade_medida: "Saco 20kg",
      id_prefix: "PROD_LARANJA_PERA",
      subclassificacoes: [
        { id_suffix: "C72", nome: "Calibre 72" },
        { id_suffix: "C88", nome: "Calibre 88" },
        { id_suffix: "C100", nome: "Calibre 100" },
        { id_suffix: "SUCO", nome: "Suco" }
      ]
    },
    "limao": {
      grupo_base: "limao",
      nome_exibicao: "Limão",
      unidade_medida: "Saco 20kg",
      id_prefix: "PROD_LIMAO",
      subclassificacoes: [
        { id_suffix: "TAHI", nome: "Tahiti" },
        { id_suffix: "SICI", nome: "Siciliano" },
        { id_suffix: "CRAV", nome: "Cravo" }
      ]
    },
    "maca": {
      grupo_base: "maca",
      nome_exibicao: "Maçã",
      unidade_medida: "Caixa 18kg",
      id_prefix: "PROD_MACA",
      subclassificacoes: [
        { id_suffix: "GALA", nome: "Gala" },
        { id_suffix: "FUJI", nome: "Fuji" },
        { id_suffix: "VERD", nome: "Verde Importada" },
        { id_suffix: "RED", nome: "Red Importada" }
      ]
    },
    "mamao": {
      grupo_base: "mamao",
      nome_exibicao: "Mamão",
      unidade_medida: "Caixa 15kg",
      id_prefix: "PROD_MAMAO",
      subclassificacoes: [
        { id_suffix: "FORM", nome: "Formosa" },
        { id_suffix: "PAPA", nome: "Papaya" }
      ]
    },
    "manga": {
      grupo_base: "manga",
      nome_exibicao: "Manga",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_MANGA",
      subclassificacoes: [
        { id_suffix: "TOMM", nome: "Tommy" },
        { id_suffix: "PALM", nome: "Palmer" },
        { id_suffix: "HADE", nome: "Haden" },
        { id_suffix: "ESPA", nome: "Espada" }
      ]
    },
    "maracuja": {
      grupo_base: "maracuja",
      nome_exibicao: "Maracujá",
      unidade_medida: "Caixa 15kg",
      id_prefix: "PROD_MARACUJA",
      subclassificacoes: [
        { id_suffix: "AZED", nome: "Azedo" },
        { id_suffix: "DOCE", nome: "Doce" }
      ]
    },
    "melancia": {
      grupo_base: "melancia",
      nome_exibicao: "Melancia",
      unidade_medida: "Kg",
      id_prefix: "PROD_MELANCIA",
      subclassificacoes: [
        { id_suffix: "GRAU", nome: "Graúda" },
        { id_suffix: "MIUD", nome: "Miúda" },
        { id_suffix: "BABY", nome: "Baby" }
      ]
    },
    "melao": {
      grupo_base: "melao",
      nome_exibicao: "Melão",
      unidade_medida: "Caixa 13kg",
      id_prefix: "PROD_MELAO",
      subclassificacoes: [
        { id_suffix: "AMAR", nome: "Amarelo" },
        { id_suffix: "PELE", nome: "Pele de Sapo" },
        { id_suffix: "CANT", nome: "Cantaloupe" }
      ]
    },
    "morango": {
      grupo_base: "morango",
      nome_exibicao: "Morango",
      unidade_medida: "Bandeja 250g",
      id_prefix: "PROD_MORANGO",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" },
        { id_suffix: "ESPE", nome: "Especial" }
      ]
    },
    "pera": {
      grupo_base: "pera",
      nome_exibicao: "Pera",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_PERA",
      subclassificacoes: [
        { id_suffix: "WILL", nome: "Williams" },
        { id_suffix: "DANG", nome: "D'Anjou" },
        { id_suffix: "PORT", nome: "Portuguesa" }
      ]
    },
    "pessego": {
      grupo_base: "pessego",
      nome_exibicao: "Pêssego",
      unidade_medida: "Caixa 10kg",
      id_prefix: "PROD_PESSEGO",
      subclassificacoes: [
        { id_suffix: "NAC", nome: "Nacional" },
        { id_suffix: "IMP", nome: "Importado" }
      ]
    },
    "uva": {
      grupo_base: "uva",
      nome_exibicao: "Uva",
      unidade_medida: "Caixa 8kg",
      id_prefix: "PROD_UVA",
      subclassificacoes: [
        { id_suffix: "NIAG", nome: "Niágara" },
        { id_suffix: "ITAL", nome: "Itália" },
        { id_suffix: "RUBI", nome: "Rubi" },
        { id_suffix: "THOM", nome: "Thompson" },
        { id_suffix: "CRIM", nome: "Crimson" }
      ]
    }
  },
  "Legumes": {
    "abobora": {
      grupo_base: "abobora",
      nome_exibicao: "Abóbora",
      unidade_medida: "Saco 20kg",
      id_prefix: "PROD_ABOBORA",
      subclassificacoes: [
        { id_suffix: "CABA", nome: "Cabotiá" },
        { id_suffix: "MORA", nome: "Moranga" },
        { id_suffix: "PAUL", nome: "Paulista" },
        { id_suffix: "SECA", nome: "Seca" }
      ]
    },
    "abobrinha": {
      grupo_base: "abobrinha",
      nome_exibicao: "Abobrinha",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_ABOBRINHA",
      subclassificacoes: [
        { id_suffix: "ITAL", nome: "Italiana" },
        { id_suffix: "BRAN", nome: "Branca" }
      ]
    },
    "alho": {
      grupo_base: "alho",
      nome_exibicao: "Alho",
      unidade_medida: "Caixa 10kg",
      id_prefix: "PROD_ALHO",
      subclassificacoes: [
        { id_suffix: "NAC", nome: "Nacional" },
        { id_suffix: "ARG", nome: "Argentino" },
        { id_suffix: "CHI", nome: "Chinês" },
        { id_suffix: "ESP", nome: "Espanhol" }
      ]
    },
    "batata_monalisa": {
      grupo_base: "batata_monalisa",
      nome_exibicao: "Batata Monalisa",
      unidade_medida: "Saco 50kg",
      id_prefix: "PROD_BATATA_MONA",
      subclassificacoes: [
        { id_suffix: "A", nome: "Tipo A" },
        { id_suffix: "AA", nome: "Tipo AA" },
        { id_suffix: "ESP", nome: "Especial" },
        { id_suffix: "LAV", nome: "Lavada" },
        { id_suffix: "ESC", nome: "Escovada" },
        { id_suffix: "DIV", nome: "Diversa" }
      ]
    },
    "berinjela": {
      grupo_base: "berinjela",
      nome_exibicao: "Berinjela",
      unidade_medida: "Caixa 15kg",
      id_prefix: "PROD_BERINJELA",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" },
        { id_suffix: "ESPE", nome: "Especial" }
      ]
    },
    "beterraba": {
      grupo_base: "beterraba",
      nome_exibicao: "Beterraba",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_BETERRABA",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" },
        { id_suffix: "ESPE", nome: "Especial" }
      ]
    },
    "cebola_nacional": {
      grupo_base: "cebola_nacional",
      nome_exibicao: "Cebola Nacional",
      unidade_medida: "Saco 20kg",
      id_prefix: "PROD_CEBOLA_NAC",
      subclassificacoes: [
        { id_suffix: "CX2", nome: "Caixa 2" },
        { id_suffix: "CX3", nome: "Caixa 3" },
        { id_suffix: "IND", nome: "Industrial" },
        { id_suffix: "ROXA", nome: "Roxa" }
      ]
    },
    "cenoura": {
      grupo_base: "cenoura",
      nome_exibicao: "Cenoura",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_CENOURA",
      subclassificacoes: [
        { id_suffix: "G", nome: "G (Grande)" },
        { id_suffix: "M", nome: "M (Média)" },
        { id_suffix: "P", nome: "P (Pequena)" },
        { id_suffix: "DESC", nome: "Descarte" }
      ]
    },
    "chuchu": {
      grupo_base: "chuchu",
      nome_exibicao: "Chuchu",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_CHUCHU",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" },
        { id_suffix: "ESPE", nome: "Especial" }
      ]
    },
    "mandioca": {
      grupo_base: "mandioca",
      nome_exibicao: "Mandioca (Macaxeira)",
      unidade_medida: "Caixa 25kg",
      id_prefix: "PROD_MANDIOCA",
      subclassificacoes: [
        { id_suffix: "BRAN", nome: "Branca" },
        { id_suffix: "AMAR", nome: "Amarela" }
      ]
    },
    "pepino": {
      grupo_base: "pepino",
      nome_exibicao: "Pepino",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_PEPINO",
      subclassificacoes: [
        { id_suffix: "CAIP", nome: "Caipira" },
        { id_suffix: "JAPO", nome: "Japonês" },
        { id_suffix: "ACOM", nome: "Comum" }
      ]
    },
    "pimentao": {
      grupo_base: "pimentao",
      nome_exibicao: "Pimentão",
      unidade_medida: "Caixa 10kg",
      id_prefix: "PROD_PIMENTAO",
      subclassificacoes: [
        { id_suffix: "VERD", nome: "Verde" },
        { id_suffix: "VERM", nome: "Vermelho" },
        { id_suffix: "AMAR", nome: "Amarelo" }
      ]
    },
    "tomate_italiano": {
      grupo_base: "tomate_italiano",
      nome_exibicao: "Tomate Italiano",
      unidade_medida: "Caixa 20kg",
      id_prefix: "PROD_TOMATE_ITA",
      subclassificacoes: [
        { id_suffix: "EXT1", nome: "Extra 1" },
        { id_suffix: "EXT2", nome: "Extra 2" },
        { id_suffix: "AAA", nome: "AAA" },
        { id_suffix: "LONG", nome: "Longa Vida" },
        { id_suffix: "SEL", nome: "Selecionado" }
      ]
    },
    "vagem": {
      grupo_base: "vagem",
      nome_exibicao: "Vagem",
      unidade_medida: "Caixa 15kg",
      id_prefix: "PROD_VAGEM",
      subclassificacoes: [
        { id_suffix: "MAC", nome: "Macarrão" },
        { id_suffix: "MAN", nome: "Manteiga" }
      ]
    }
  },
  "Verduras": {
    "acelga": {
      grupo_base: "acelga",
      nome_exibicao: "Acelga",
      unidade_medida: "Caixa 15kg",
      id_prefix: "PROD_ACELGA",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" }
      ]
    },
    "agriao": {
      grupo_base: "agriao",
      nome_exibicao: "Agrião",
      unidade_medida: "Maço",
      id_prefix: "PROD_AGRIAO",
      subclassificacoes: [
        { id_suffix: "PADR", nome: "Padrão" },
        { id_suffix: "HIDR", nome: "Hidropônico" }
      ]
    },
    "alface": {
      grupo_base: "alface",
      nome_exibicao: "Alface",
      unidade_medida: "Maço",
      id_prefix: "PROD_ALFACE",
      subclassificacoes: [
        { id_suffix: "CRES", nome: "Crespa" },
        { id_suffix: "LISA", nome: "Lisa" },
        { id_suffix: "AMER", nome: "Americana" },
        { id_suffix: "HIDR", nome: "Hidropônica" }
      ]
    },
    "brocolis": {
      grupo_base: "brocolis",
      nome_exibicao: "Brócolis",
      unidade_medida: "Caixa 10kg",
      id_prefix: "PROD_BROCOLIS",
      subclassificacoes: [
        { id_suffix: "NINJ", nome: "Ninja" },
        { id_suffix: "RAMO", nome: "Ramoso" }
      ]
    },
    "cebolinha": {
      grupo_base: "cebolinha",
      nome_exibicao: "Cebolinha",
      unidade_medida: "Maço",
      id_prefix: "PROD_CEBOLINHA",
      subclassificacoes: [
        { id_suffix: "PADR", nome: "Padrão" }
      ]
    },
    "coentro": {
      grupo_base: "coentro",
      nome_exibicao: "Coentro",
      unidade_medida: "Maço",
      id_prefix: "PROD_COENTRO",
      subclassificacoes: [
        { id_suffix: "PADR", nome: "Padrão" }
      ]
    },
    "couve": {
      grupo_base: "couve",
      nome_exibicao: "Couve",
      unidade_medida: "Maço",
      id_prefix: "PROD_COUVE",
      subclassificacoes: [
        { id_suffix: "MANT", nome: "Manteiga" }
      ]
    },
    "couve_flor": {
      grupo_base: "couve_flor",
      nome_exibicao: "Couve-Flor",
      unidade_medida: "Caixa 15kg",
      id_prefix: "PROD_COUVE_FLOR",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" },
        { id_suffix: "ESPE", nome: "Especial" }
      ]
    },
    "espinafre": {
      grupo_base: "espinafre",
      nome_exibicao: "Espinafre",
      unidade_medida: "Maço",
      id_prefix: "PROD_ESPINAFRE",
      subclassificacoes: [
        { id_suffix: "PADR", nome: "Padrão" }
      ]
    },
    "repolho": {
      grupo_base: "repolho",
      nome_exibicao: "Repolho",
      unidade_medida: "Saco 25kg",
      id_prefix: "PROD_REPOLHO",
      subclassificacoes: [
        { id_suffix: "VERD", nome: "Verde" },
        { id_suffix: "ROXO", nome: "Roxo" }
      ]
    },
    "rucula": {
      grupo_base: "rucula",
      nome_exibicao: "Rúcula",
      unidade_medida: "Maço",
      id_prefix: "PROD_RUCULA",
      subclassificacoes: [
        { id_suffix: "PADR", nome: "Padrão" },
        { id_suffix: "HIDR", nome: "Hidropônica" }
      ]
    },
    "salsa": {
      grupo_base: "salsa",
      nome_exibicao: "Salsa",
      unidade_medida: "Maço",
      id_prefix: "PROD_SALSA",
      subclassificacoes: [
        { id_suffix: "PADR", nome: "Padrão" }
      ]
    }
  },
  "Ovos": {
    "ovo_branco": {
      grupo_base: "ovo_branco",
      nome_exibicao: "Ovo Branco",
      unidade_medida: "Caixa 30 dúzias",
      id_prefix: "PROD_OVO_BRANCO",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" },
        { id_suffix: "GRAU", nome: "Grande" },
        { id_suffix: "MEDI", nome: "Médio" },
        { id_suffix: "PEQU", nome: "Pequeno" }
      ]
    },
    "ovo_vermelho": {
      grupo_base: "ovo_vermelho",
      nome_exibicao: "Ovo Vermelho",
      unidade_medida: "Caixa 30 dúzias",
      id_prefix: "PROD_OVO_VERM",
      subclassificacoes: [
        { id_suffix: "EXTR", nome: "Extra" },
        { id_suffix: "GRAU", nome: "Grande" },
        { id_suffix: "MEDI", nome: "Médio" }
      ]
    },
    "ovo_codorna": {
      grupo_base: "ovo_codorna",
      nome_exibicao: "Ovo de Codorna",
      unidade_medida: "Caixa 50 dúzias",
      id_prefix: "PROD_OVO_COD",
      subclassificacoes: [
        { id_suffix: "PADR", nome: "Padrão" }
      ]
    }
  },
  "Cereais e Grãos": {
    "arroz": {
      grupo_base: "arroz",
      nome_exibicao: "Arroz",
      unidade_medida: "Fardo 30kg",
      id_prefix: "PROD_ARROZ",
      subclassificacoes: [
        { id_suffix: "T1", nome: "Tipo 1" },
        { id_suffix: "T2", nome: "Tipo 2" },
        { id_suffix: "PARB", nome: "Parboilizado" }
      ]
    },
    "feijao": {
      grupo_base: "feijao",
      nome_exibicao: "Feijão",
      unidade_medida: "Fardo 30kg",
      id_prefix: "PROD_FEIJAO",
      subclassificacoes: [
        { id_suffix: "CAR", nome: "Carioca" },
        { id_suffix: "PRE", nome: "Preto" },
        { id_suffix: "FRA", nome: "Fradinho" }
      ]
    },
    "milho": {
      grupo_base: "milho",
      nome_exibicao: "Milho",
      unidade_medida: "Saco 50kg",
      id_prefix: "PROD_MILHO",
      subclassificacoes: [
        { id_suffix: "PIP", nome: "Pipoca" },
        { id_suffix: "CAN", nome: "Canjica" },
        { id_suffix: "GRA", nome: "Grão" }
      ]
    },
    "amendoim": {
      grupo_base: "amendoim",
      nome_exibicao: "Amendoim",
      unidade_medida: "Saco 50kg",
      id_prefix: "PROD_AMENDOIM",
      subclassificacoes: [
        { id_suffix: "CAS", nome: "Com Casca" },
        { id_suffix: "SCA", nome: "Sem Casca" }
      ]
    }
  },
  "Diversos": {
    "alho_poro": {
      grupo_base: "alho_poro",
      nome_exibicao: "Alho Poró",
      unidade_medida: "Maço",
      id_prefix: "PROD_ALHO_PORO",
      subclassificacoes: [
        { id_suffix: "PADR", nome: "Padrão" }
      ]
    }
  }
};
