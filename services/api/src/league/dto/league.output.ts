import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

@ObjectType()
export class LeagueOutput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field()
  @IsString()
  slug!: string;

  @Field()
  @IsString()
  displayName!: string;

  @Field()
  @IsString()
  country!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  tier?: number;

  @Field()
  @IsBoolean()
  isActive!: boolean;
}
