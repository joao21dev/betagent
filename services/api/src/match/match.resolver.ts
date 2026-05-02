import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../auth/gql-auth.guard";
import { GetMatchesArgs } from "./dto/get-matches.args";
import { MatchOutput } from "./dto/match.output";
import { MatchService } from "./match.service";

@Resolver(() => MatchOutput)
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}

  @Query(() => [MatchOutput], { name: "matches" })
  @UseGuards(GqlAuthGuard)
  async getMatches(@Args() input: GetMatchesArgs): Promise<MatchOutput[]> {
    return this.matchService.list({
      skip: input.skip,
      take: input.take,
      leagueId: input.leagueId,
      kickoffFrom: input.kickoffFrom,
      kickoffTo: input.kickoffTo,
    });
  }
}
