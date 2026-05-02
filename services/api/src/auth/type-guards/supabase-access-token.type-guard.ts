import type { SupabaseAccessTokenPayload } from "../interfaces/supabase-access-token.interface";

export function isSupabaseJwtPayload(value: unknown): value is SupabaseAccessTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.sub === "string";
}
