import { Field, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { MatchStatus } from "@repo/prisma-client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { LeagueOutput } from "../../league/dto/league.output";
import { TeamOutput } from "../../league/dto/team.output";

@ObjectType()
export class MatchOutput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field(() => GraphQLISODateTime)
  kickoffAt!: Date;

  @Field(() => MatchStatus)
  @IsEnum(MatchStatus)
  status!: MatchStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  venueName?: string;

  @Field(() => LeagueOutput)
  league!: LeagueOutput;

  @Field(() => TeamOutput)
  homeTeam!: TeamOutput;

  @Field(() => TeamOutput)
  awayTeam!: TeamOutput;
}
