import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MatchResolver } from "./match.resolver";
import { MatchService } from "./match.service";

@Module({
  imports: [AuthModule],
  providers: [MatchService, MatchResolver],
})
export class MatchModule {}
