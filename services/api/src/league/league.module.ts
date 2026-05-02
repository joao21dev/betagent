import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LeagueResolver } from "./league.resolver";
import { LeagueService } from "./league.service";

@Module({
  imports: [AuthModule],
  providers: [LeagueService, LeagueResolver],
})
export class LeagueModule {}
