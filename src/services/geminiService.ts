import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ClassificationResult {
  produto_principal: string;
  variedade: string;
  classificacao_comercial: string;
  observacoes_visuais: string;
  confianca_identificacao: string;
  logistica_metadata: {
    is_fragile: boolean;
    handling_instructions: string;
    estimated_weight_kg_unit: number;
    maturity_level: 'verde' | 'maduro' | 'avancado';
    condition_status: 'excelente' | 'bom' | 'regular' | 'ruim';
    requires_refrigeration: boolean;
  };
}

export async function classifyProductImage(base64Image: string): Promise<ClassificationResult | null> {
  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: "Analise esta imagem de produto agrícola como um Especialista em Classificação Hortifrutigranjeira de Alta Precisão.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: `Atue como um Especialista em Classificação Hortifrutigranjeira de Alta Precisão.
Sua tarefa é analisar imagens de produtos agrícolas enviadas por produtores e realizar a identificação automática imediata, categorizando-as conforme os padrões de mercado (Ex: CEAGESP).

Diretrizes de Análise:
1. Identificação Principal: Identifique o tipo básico (Ex: Batata, Tomate, Cebola).
2. Variedade Genética/Comercial: Diferencie subnomes (Ex: Tomate Italiano vs. Débora).
3. Estado de Beneficiamento: Identifique se o produto passou por processos (Ex: Batata Lavada vs. Escovada/Suja).
4. Calibre/Tamanho: Estime a classificação por tamanho quando possível (Ex: Batata Bolinha, Cebola Baby).
5. Logística: Determine se o produto é frágil, instruções de manuseio, peso estimado por unidade (ex: saca 50kg, caixa 20kg), nível de maturação e estado geral de conservação.

Responda SEMPRE em formato JSON estruturado.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            produto_principal: { type: Type.STRING },
            variedade: { type: Type.STRING },
            classificacao_comercial: { type: Type.STRING },
            observacoes_visuais: { type: Type.STRING },
            confianca_identificacao: { type: Type.STRING },
            logistica_metadata: {
              type: Type.OBJECT,
              properties: {
                is_fragile: { type: Type.BOOLEAN },
                handling_instructions: { type: Type.STRING },
                estimated_weight_kg_unit: { type: Type.NUMBER },
                maturity_level: { type: Type.STRING, enum: ['verde', 'maduro', 'avancado'] },
                condition_status: { type: Type.STRING, enum: ['excelente', 'bom', 'regular', 'ruim'] },
                requires_refrigeration: { type: Type.BOOLEAN }
              },
              required: ["is_fragile", "handling_instructions", "estimated_weight_kg_unit", "maturity_level", "condition_status", "requires_refrigeration"]
            }
          },
          required: ["produto_principal", "variedade", "classificacao_comercial", "observacoes_visuais", "confianca_identificacao", "logistica_metadata"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error classifying product image:", error);
    return null;
  }
}
