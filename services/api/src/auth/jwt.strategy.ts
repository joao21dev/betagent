import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtUserPayload } from "./interfaces/jwt-user-payload.interface";
import { isSupabaseJwtPayload } from "./type-guards/supabase-access-token.type-guard";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>("SUPABASE_JWT_SECRET");
    if (!secret) {
      throw new Error("SUPABASE_JWT_SECRET is required");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ["HS256"],
    });
  }

  validate(payload: unknown): JwtUserPayload {
    if (!isSupabaseJwtPayload(payload)) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const issuer = this.config.get<string>("SUPABASE_JWT_ISSUER");
    if (issuer && payload.iss !== issuer) {
      throw new UnauthorizedException("Invalid token issuer");
    }

    return {
      userId: payload.sub,
      ...(payload.email ? { email: payload.email } : {}),
    };
  }
}
