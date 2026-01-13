// utils.ts
type InRow = {
    id: number;
    metadata?: {
      zona?: string[] | string;
      planes?: string[] | string;
      ciudad?: string | null;
      document_id?: string | null;
      document_Id?: string | null;  // tolerancia a variantes
      documentID?: string | null;   // tolerancia a variantes
      keywords?: string[] | string;
      [k: string]: unknown;         // resto de metadatos
    };
    created_at?: string;
    updated_at?: string;
  };
  
  export type OutRow = {
    zona: string[];
    planes: string[];
    ciudad: string | null;
    document_id: string | null;
    keywords: string[];
  };
  
  const toArray = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]) : v != null ? [String(v)] : [];

  const canonical = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  
  const uniqByCanonicalSorted = (arr: string[]) =>
    Array.from(new Map(arr.map(v => [canonical(v), v])).values())
        .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  
  export function pickMetadataFieldsTS(rows: InRow[]): OutRow[] {
    if (!Array.isArray(rows)) return [];
    return rows.map(({ metadata = {} }) => {
        const zona     = uniqByCanonicalSorted(toArray(metadata.zona));
        const planes   = uniqByCanonicalSorted(toArray(metadata.planes));
        const keywords = uniqByCanonicalSorted(toArray(metadata.keywords));
        const ciudad   = typeof metadata.ciudad === "string" ? metadata.ciudad : null;
        const document_id =
          metadata.document_id ?? metadata.document_Id ?? metadata.documentID ?? null;
  
      return { zona, planes, ciudad, document_id, keywords };
    });
  }
  type InRow_strict = Partial<{
    zona: unknown;
    planes: unknown;
    ciudad: unknown;
    document_id: unknown;
    keywords: unknown;
  }>;
  
  type Aggregated = {
    zona: string[];
    planes: string[];
    ciudad: string[];
    document_id: string[];
    keywords: string[];
  };
  
  /** Normalización opcional para dedup “inteligente” (no la aplico por defecto) */
  const canonical_srtrict = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  
  /** Convierte cualquier valor a array de strings limpio */
  const arrify = (v: unknown): string[] => {
    if (v == null) return [];
    const base = Array.isArray(v) ? v.flat(2) : [v];
    return base
      .filter(x => x != null)
      .map(x => String(x).trim())
      .filter(x => x.length > 0);
  };
  
  /** Dedup + orden */
  const uniqSort = (arr: string[]) =>
    [...new Set(arr)].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  
  /**
   * Siempre devuelve arrays para cada key (sin null/strings sueltos).
   * @param rows tu array de objetos “flat” por documento (zona, planes, ciudad, document_id, keywords)
   * @param opts.mode "raw" (default) conserva tal cual; "canonical" dedup por slug pero devuelve la primera variante original
   */
  export function aggregateOptionsStrict(
    rows: InRow_strict[],
    opts: { mode?: "raw" | "canonical" } = {}
  ): Aggregated {
    const mode = opts.mode ?? "raw";
  
    // usamos Map para dedup opcional por canónico preservando 1ª variante original
    const acc = {
      zona: new Map<string, string>(),
      planes: new Map<string, string>(),
      ciudad: new Map<string, string>(),
      document_id: new Map<string, string>(),
      keywords: new Map<string, string>(),
    };
  
    const addMany = (map: Map<string, string>, values: string[]) => {
      for (const v of values) {
        const key = mode === "canonical" ? canonical_srtrict(v) : v;
        if (!map.has(key)) map.set(key, v); // preserva la primera variante original
      }
    };
  
    for (const r of rows ?? []) {
      addMany(acc.zona, arrify(r.zona));
      addMany(acc.planes, arrify(r.planes));
      addMany(acc.ciudad, arrify(r.ciudad));
      addMany(acc.document_id, arrify(r.document_id));
      addMany(acc.keywords, arrify(r.keywords));
    }
  
    return {
      zona: uniqSort([...acc.zona.values()]),
      planes: uniqSort([...acc.planes.values()]),
      ciudad: uniqSort([...acc.ciudad.values()]),
      document_id: uniqSort([...acc.document_id.values()]),
      keywords: uniqSort([...acc.keywords.values()]),
    };
  }
  