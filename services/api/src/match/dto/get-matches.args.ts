import { ArgsType, Field, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsISO8601, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

@ArgsType()
export class GetMatchesArgs {
  @Field(() => Int, { defaultValue: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip!: number;

  @Field(() => Int, { defaultValue: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]{20,40}$/)
  leagueId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  kickoffFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  kickoffTo?: string;
}
