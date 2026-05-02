import { join } from "node:path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule, registerEnumType } from "@nestjs/graphql";
import { MatchStatus } from "@repo/prisma-client";
import { AuthModule } from "./auth/auth.module";
import { LeagueModule } from "./league/league.module";
import { MatchModule } from "./match/match.module";
import { PrismaModule } from "./prisma/prisma.module";

registerEnumType(MatchStatus, {
  name: "MatchStatus",
});

const isProduction = process.env.NODE_ENV === "production";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(__dirname, "..", "graphql-schema.generated.gql"),
      sortSchema: true,
      playground: false,
      plugins: isProduction ? [] : [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
    }),
    PrismaModule,
    AuthModule,
    LeagueModule,
    MatchModule,
  ],
})
export class AppModule {}
