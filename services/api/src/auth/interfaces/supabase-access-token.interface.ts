export interface SupabaseAccessTokenPayload {
  readonly sub: string;
  readonly email?: string;
  readonly iss?: string;
}
