import { z } from 'zod';

// ==========================================
// TIPOS GENÉRICOS
// ==========================================

export interface MetadataRow {
  id: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  agent_id?: string | null;
}

export interface ExtractedMetadata {
  [key: string]: string[];
}

export interface MetadataField {
  key: string;
  values: string[];
  type: 'string' | 'array' | 'boolean' | 'number';
}

// ==========================================
// FUNCIONES DE NORMALIZACIÓN
// ==========================================

/**
 * Normaliza un string para comparación (sin acentos, minúsculas, sin espacios extra)
 */
const canonical = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/**
 * Convierte cualquier valor a array de strings
 */
const toArray = (v: unknown): string[] => {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v
      .flat(2)
      .filter(x => x != null)
      .map(x => String(x).trim())
      .filter(x => x.length > 0);
  }
  if (typeof v === 'object') {
    return Object.values(v)
      .filter(x => x != null)
      .map(x => String(x).trim())
      .filter(x => x.length > 0);
  }
  const str = String(v).trim();
  return str.length > 0 ? [str] : [];
};

/**
 * Dedup y ordenamiento
 */
const uniqSort = (arr: string[]): string[] =>
  [...new Set(arr)].sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  );

/**
 * Dedup por canonical pero preserva el valor original
 */
// const uniqByCanonical = (arr: string[]): string[] => {
//   const map = new Map<string, string>();
//   for (const val of arr) {
//     const key = canonical(val);
//     if (!map.has(key)) {
//       map.set(key, val);
//     }
//   }
//   return uniqSort([...map.values()]);
// };

// ==========================================
// EXTRACCIÓN DINÁMICA DE METADATA
// ==========================================

/**
 * Extrae TODAS las claves de metadata de un conjunto de rows
 * @param rows Array de documentos con metadata
 * @returns Set con todas las claves únicas encontradas
 */
export function extractMetadataKeys(rows: MetadataRow[]): Set<string> {
  const keys = new Set<string>();
  
  for (const row of rows) {
    if (row.metadata && typeof row.metadata === 'object') {
      Object.keys(row.metadata).forEach(key => keys.add(key));
    }
  }
  
  return keys;
}

/**
 * Extrae y agrega valores para todas las claves de metadata
 * @param rows Array de documentos con metadata
 * @param options Opciones de normalización
 * @returns Objeto con arrays de valores únicos para cada clave
 */
export function extractAllMetadataValues(
  rows: MetadataRow[],
  options: {
    mode?: 'raw' | 'canonical';
    excludeKeys?: string[];
    includeKeys?: string[];
  } = {}
): ExtractedMetadata {
  const { mode = 'canonical', excludeKeys = [], includeKeys } = options;
  
  // Obtener todas las claves
  const allKeys = extractMetadataKeys(rows);
  
  // Filtrar claves según opciones
  const keysToProcess = Array.from(allKeys).filter(key => {
    if (excludeKeys.includes(key)) return false;
    if (includeKeys && !includeKeys.includes(key)) return false;
    return true;
  });
  
  // Acumular valores para cada clave
  const accumulated: Record<string, Map<string, string>> = {};
  
  for (const key of keysToProcess) {
    accumulated[key] = new Map<string, string>();
  }
  
  // Procesar cada row
  for (const row of rows) {
    if (!row.metadata) continue;
    
    for (const key of keysToProcess) {
      const value = row.metadata[key];
      if (value == null) continue;
      
      const values = toArray(value);
      
      for (const val of values) {
        const mapKey = mode === 'canonical' ? canonical(val) : val;
        if (!accumulated[key].has(mapKey)) {
          accumulated[key].set(mapKey, val); // Preserva el valor original
        }
      }
    }
  }
  
  // Convertir a arrays ordenados
  const result: ExtractedMetadata = {};
  
  for (const key of keysToProcess) {
    result[key] = uniqSort([...accumulated[key].values()]);
  }
  
  return result;
}

/**
 * Analiza el tipo de datos de una clave de metadata
 */
export function analyzeMetadataField(
  rows: MetadataRow[],
  key: string
): MetadataField {
  const values = new Set<string>();
  let hasArray = false;
  let hasBoolean = false;
  let hasNumber = false;
  
  for (const row of rows) {
    const val = row.metadata?.[key];
    if (val == null) continue;
    
    if (Array.isArray(val)) hasArray = true;
    if (typeof val === 'boolean') hasBoolean = true;
    if (typeof val === 'number') hasNumber = true;
    
    toArray(val).forEach(v => values.add(v));
  }
  
  let type: MetadataField['type'] = 'string';
  if (hasArray) type = 'array';
  if (hasBoolean && values.size <= 2) type = 'boolean';
  if (hasNumber && !hasArray) type = 'number';
  
  return {
    key,
    values: uniqSort([...values]),
    type,
  };
}

// ==========================================
// GENERACIÓN DINÁMICA DE SCHEMAS ZOD
// ==========================================

/**
 * Genera un schema de Zod dinámicamente basado en metadata extraída
 * @param metadata Metadata extraída con extractAllMetadataValues
 * @param descriptions Descripciones personalizadas para cada campo
 * @returns Schema de Zod
 */
export function buildDynamicZodSchema(
  metadata: ExtractedMetadata,
  descriptions?: Record<string, string>
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  for (const [key, values] of Object.entries(metadata)) {
    if (values.length === 0) {
      // Si no hay valores, campo string opcional
      shape[key] = z.string().optional().describe(
        descriptions?.[key] || `Campo ${key}`
      );
      continue;
    }
    
    if (values.length === 1) {
      // Si solo hay un valor, campo literal o string opcional
      shape[key] = z
        .literal(values[0])
        .optional()
        .describe(descriptions?.[key] || `Campo ${key}`);
      continue;
    }
    
    // Si hay múltiples valores, usar enum
    shape[key] = z
      .enum(values as [string, ...string[]])
      .optional()
      .nullable()
      .describe(descriptions?.[key] || `Campo ${key}`);
  }
  
  return z.object(shape);
}

/**
 * Genera un schema más inteligente analizando los tipos
 */
export function buildSmartZodSchema(
  rows: MetadataRow[],
  options: {
    excludeKeys?: string[];
    includeKeys?: string[];
    descriptions?: Record<string, string>;
    makeAllOptional?: boolean;
  } = {}
): z.ZodObject<any> {
  const { excludeKeys = [], includeKeys, descriptions = {}, makeAllOptional = true } = options;
  
  const allKeys = extractMetadataKeys(rows);
  const keysToProcess = Array.from(allKeys).filter(key => {
    if (excludeKeys.includes(key)) return false;
    if (includeKeys && !includeKeys.includes(key)) return false;
    return true;
  });
  
  const shape: Record<string, z.ZodTypeAny> = {};
  
  for (const key of keysToProcess) {
    const field = analyzeMetadataField(rows, key);
    const description = descriptions[key] || `Campo ${key}`;
    
    let zodType: z.ZodTypeAny;
    
    if (field.values.length === 0) {
      zodType = z.string().describe(description);
    } else if (field.values.length === 1) {
      zodType = z.literal(field.values[0]).describe(description);
    } else {
      // Enum con múltiples valores
      zodType = z.enum(field.values as [string, ...string[]]).describe(description);
    }
    
    // Hacer opcional si se configuró
    if (makeAllOptional) {
      zodType = zodType.optional().nullable();
    }
    
    shape[key] = zodType;
  }
  
  return z.object(shape);
}

// ==========================================
// HELPER: Schema Builder desde RPC
// ==========================================

/**
 * Obtiene metadata de Supabase y genera schema dinámicamente
 */
export async function buildSchemaFromSupabase(
  supabaseClient: any,
  tableName: string,
  options: {
    rpcFunction?: string;
    limit?: number;
    offset?: number;
    excludeKeys?: string[];
    includeKeys?: string[];
    descriptions?: Record<string, string>;
    mode?: 'raw' | 'canonical';
  } = {}
): Promise<ExtractedMetadata> {
  const {
    rpcFunction = `${tableName}_get_metadata`,
    limit = 100,
    offset = 0,
    excludeKeys,
    includeKeys,
   
    mode = 'canonical',
  } = options;
  
  // Llamar a la función RPC
  const { data, error } = await supabaseClient.rpc(rpcFunction, {
    p_limit: limit,
    p_offset: offset,
  });
  
  if (error) {
    throw new Error(`Error fetching metadata from ${rpcFunction}: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error(`No data returned from ${rpcFunction}`);
  }
  
  // Extraer metadata
  const metadata = extractAllMetadataValues(data, {
    mode,
    excludeKeys,
    includeKeys,
  });
  return metadata;
  // Generar schema
  // return buildDynamicZodSchema(metadata, descriptions);
}