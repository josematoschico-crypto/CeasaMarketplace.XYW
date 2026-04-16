import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Product } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recebe um array bruto (flat) de produtos com IDs únicos
 * e os agrupa pelo campo grupo_base.
 * Prioriza performance usando reduce (O(n)).
 */
export function groupProductsByBase(products: Product[]): Record<string, Product[]> {
  return products.reduce((acc, product) => {
    const key = product.grupo_base;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
}
