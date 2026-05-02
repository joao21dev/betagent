import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@ObjectType()
export class TeamOutput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shortName?: string;
}
