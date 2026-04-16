import { ClassificationResult } from './geminiService';

export type LalamoveVehicleType = 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK_2T';

export interface LalamoveLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface LalamovePayload {
  service_type: LalamoveVehicleType;
  stops: {
    location: { lat: string; lng: string };
    addresses: string;
  }[];
  item_details: {
    display_name: string;
    quantity: number;
    is_fragile: boolean;
    handling_instructions: string;
  };
  automation_metadata: {
    vinculo_rastreio_ia: string;
    timestamp_despacho: string;
  };
}

export interface LalamoveQuotation {
  id: string;
  totalFee: string;
  currency: string;
}

export interface LalamoveOrder {
  id: string;
  status: 'ASSIGNING_DRIVER' | 'ON_THE_WAY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  driverId?: string;
}

/**
 * Maps product type and total weight to a Lalamove vehicle type.
 */
export function mapVehicleType(productName: string, totalWeightKg: number): LalamoveVehicleType {
  if (totalWeightKg > 500) return 'TRUCK_2T';
  if (totalWeightKg > 100) return 'VAN';
  
  // Fragile products or medium weight
  const fragileKeywords = ['tomate', 'morango', 'uva', 'folhagem'];
  const isFragile = fragileKeywords.some(k => productName.toLowerCase().includes(k));
  
  if (isFragile || totalWeightKg > 20) return 'CAR';
  return 'MOTORCYCLE';
}

/**
 * Generates handling instructions based on AI classification.
 */
export function generateHandlingInstructions(aiResult: ClassificationResult): string {
  let instructions = aiResult.logistica_metadata.handling_instructions;
  
  if (aiResult.logistica_metadata.is_fragile) {
    instructions += " | NÃO EMPILHAR - PRODUTO FRÁGIL";
  }
  
  if (aiResult.produto_principal.toLowerCase().includes('batata') && aiResult.variedade.toLowerCase().includes('escovada')) {
    instructions += " | MANTER EM LOCAL SECO E AREJADO";
  }

  if (aiResult.logistica_metadata.requires_refrigeration) {
    instructions += " | TRANSPORTE REFRIGERADO RECOMENDADO";
  }
  
  return instructions;
}

/**
 * Generates the Lalamove payload.
 */
export function createLalamovePayload(
  aiResult: ClassificationResult,
  quantity: number,
  pickup: LalamoveLocation,
  delivery: LalamoveLocation,
  trackingId: string
): LalamovePayload {
  const totalWeight = aiResult.logistica_metadata.estimated_weight_kg_unit * quantity;
  const vehicleType = mapVehicleType(aiResult.produto_principal, totalWeight);
  const handling = generateHandlingInstructions(aiResult);
  
  // Priority logic
  const isPriority = aiResult.logistica_metadata.maturity_level === 'avancado';
  const displayName = `${isPriority ? '[PRIORIDADE] ' : ''}${quantity}x ${aiResult.produto_principal} ${aiResult.variedade}`;

  return {
    service_type: vehicleType,
    stops: [
      {
        location: { lat: pickup.lat.toString(), lng: pickup.lng.toString() },
        addresses: pickup.address
      },
      {
        location: { lat: delivery.lat.toString(), lng: delivery.lng.toString() },
        addresses: delivery.address
      }
    ],
    item_details: {
      display_name: displayName,
      quantity: quantity,
      is_fragile: aiResult.logistica_metadata.is_fragile,
      handling_instructions: handling
    },
    automation_metadata: {
      vinculo_rastreio_ia: trackingId,
      timestamp_despacho: new Date().toISOString()
    }
  };
}

/**
 * Mocks Lalamove API calls.
 */
export const lalamoveApi = {
  async getQuotation(payload: LalamovePayload): Promise<LalamoveQuotation> {
    console.log('Lalamove Quotation Request:', payload);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: `QUO-${Math.random().toString(36).substr(2, 9)}`,
      totalFee: (Math.random() * 50 + 15).toFixed(2),
      currency: 'BRL'
    };
  },

  async placeOrder(quotationId: string, payload: LalamovePayload): Promise<LalamoveOrder> {
    console.log('Lalamove Order Request:', { quotationId, payload });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      id: `LALA-${Math.random().toString(36).substr(2, 9)}`,
      status: 'ASSIGNING_DRIVER'
    };
  }
};
