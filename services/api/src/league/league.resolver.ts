import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../auth/gql-auth.guard";
import { GetLeaguesArgs } from "./dto/get-leagues.args";
import { LeagueOutput } from "./dto/league.output";
import { LeagueService } from "./league.service";

@Resolver(() => LeagueOutput)
export class LeagueResolver {
  constructor(private readonly leagueService: LeagueService) {}

  @Query(() => [LeagueOutput], { name: "leagues" })
  @UseGuards(GqlAuthGuard)
  async getLeagues(@Args() input: GetLeaguesArgs): Promise<LeagueOutput[]> {
    return this.leagueService.list({
      skip: input.skip,
      take: input.take,
      country: input.country,
    });
  }
}
