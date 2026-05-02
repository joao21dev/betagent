import { PrismaClient } from "@repo/prisma-client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const sport = await prisma.sport.create({
    data: {
      slug: "football",
      displayName: "Football",
    },
  });

  const league = await prisma.league.create({
    data: {
      sportId: sport.id,
      externalSportsId: "seed-league-1",
      externalSportsProvider: "seed",
      slug: "seed-premier-example",
      displayName: "Example Premier Division",
      country: "BR",
      tier: 1,
      currentSeason: "2026",
      isActive: true,
    },
  });

  const home = await prisma.team.create({
    data: {
      leagueId: league.id,
      externalSportsId: "seed-team-home",
      externalSportsProvider: "seed",
      name: "Home United",
      shortName: "HOM",
      countryCode: "BR",
    },
  });

  const away = await prisma.team.create({
    data: {
      leagueId: league.id,
      externalSportsId: "seed-team-away",
      externalSportsProvider: "seed",
      name: "Away City",
      shortName: "AWY",
      countryCode: "BR",
    },
  });

  await prisma.match.create({
    data: {
      leagueId: league.id,
      externalSportsId: "seed-match-1",
      externalSportsProvider: "seed",
      homeTeamId: home.id,
      awayTeamId: away.id,
      kickoffAt: new Date("2026-06-01T18:00:00.000Z"),
      venueName: "Example Arena",
      status: "SCHEDULED",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
