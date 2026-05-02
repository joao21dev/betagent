import { Injectable } from "@nestjs/common";
import type { League, Prisma, Team } from "@repo/prisma-client";
import { LeagueOutput } from "../league/dto/league.output";
import { TeamOutput } from "../league/dto/team.output";
import { PrismaService } from "../prisma/prisma.service";
import { MatchOutput } from "./dto/match.output";

type MatchWithRelations = Prisma.MatchGetPayload<{
  include: { league: true; homeTeam: true; awayTeam: true };
}>;

export type ListMatchesInput = Readonly<{
  skip: number;
  take: number;
  leagueId?: string;
  kickoffFrom?: string;
  kickoffTo?: string;
}>;

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async list(input: ListMatchesInput): Promise<MatchOutput[]> {
    const where: Prisma.MatchWhereInput = {};
    if (input.leagueId) {
      where.leagueId = input.leagueId;
    }
    if (input.kickoffFrom ?? input.kickoffTo) {
      where.kickoffAt = {};
      if (input.kickoffFrom) {
        where.kickoffAt.gte = new Date(input.kickoffFrom);
      }
      if (input.kickoffTo) {
        where.kickoffAt.lte = new Date(input.kickoffTo);
      }
    }

    const rows = await this.prisma.match.findMany({
      where,
      skip: input.skip,
      take: input.take,
      orderBy: { kickoffAt: "asc" },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
      },
    });

    return rows.map((row) => this.toOutput(row));
  }

  private toOutput(row: MatchWithRelations): MatchOutput {
    const output = new MatchOutput();
    output.id = row.id;
    output.kickoffAt = row.kickoffAt;
    output.status = row.status;
    output.venueName = row.venueName ?? undefined;
    output.league = this.toLeagueOutput(row.league);
    output.homeTeam = this.toTeamOutput(row.homeTeam);
    output.awayTeam = this.toTeamOutput(row.awayTeam);
    return output;
  }

  private toLeagueOutput(league: League): LeagueOutput {
    const output = new LeagueOutput();
    output.id = league.id;
    output.slug = league.slug;
    output.displayName = league.displayName;
    output.country = league.country;
    output.tier = league.tier ?? undefined;
    output.isActive = league.isActive;
    return output;
  }

  private toTeamOutput(team: Team): TeamOutput {
    const output = new TeamOutput();
    output.id = team.id;
    output.name = team.name;
    output.shortName = team.shortName ?? undefined;
    return output;
  }
}
