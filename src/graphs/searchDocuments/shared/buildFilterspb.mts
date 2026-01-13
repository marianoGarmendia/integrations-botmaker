import type { SupabaseFilterRPCCall } from "@langchain/community/vectorstores/supabase";

// Escapa caracteres especiales de LIKE
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (ch) => `\\${ch}`);

export function buildFilenameFilter(
  query: string,
  opts: { mode?: "AND" | "OR"; field?: string } = {}
): SupabaseFilterRPCCall {
  const mode = opts.mode ?? "AND";
  const field = opts.field ?? "metadata->>title";
  const terms = query.trim().split(/\s+/).filter(Boolean).map(escapeLike);

  return (rpc) => {
    if (terms.length === 0) return rpc;
    if (mode === "AND") {
      // Todas las palabras deben estar (AND)
      let qb = rpc;
      for (const t of terms) qb = qb.ilike(field, `%${t}%`);
      return qb;
    } else {
      // Cualquiera de las palabras (OR)
      const orExpr = terms.map((t) => `ilike.${field}.%${t}%`).join(",");
      return rpc.or(orExpr);
    }
  };
}
