import { Injectable } from "@nestjs/common";
import type { League } from "@repo/prisma-client";
import { PrismaService } from "../prisma/prisma.service";
import { LeagueOutput } from "./dto/league.output";

export type ListLeaguesInput = Readonly<{
  skip: number;
  take: number;
  country?: string;
}>;

@Injectable()
export class LeagueService {
  constructor(private readonly prisma: PrismaService) {}

  async list(input: ListLeaguesInput): Promise<LeagueOutput[]> {
    const where = input.country ? { country: input.country } : {};
    const rows = await this.prisma.league.findMany({
      where,
      skip: input.skip,
      take: input.take,
      orderBy: { displayName: "asc" },
    });
    return rows.map((row) => this.toOutput(row));
  }

  private toOutput(row: League): LeagueOutput {
    const output = new LeagueOutput();
    output.id = row.id;
    output.slug = row.slug;
    output.displayName = row.displayName;
    output.country = row.country;
    output.tier = row.tier ?? undefined;
    output.isActive = row.isActive;
    return output;
  }
}
