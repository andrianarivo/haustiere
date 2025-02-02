import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, Min, IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateCatInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  age: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  breed?: string;
} 