import { ArgsType, Field, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

@ArgsType()
export class GetLeaguesArgs {
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
  country?: string;
}
