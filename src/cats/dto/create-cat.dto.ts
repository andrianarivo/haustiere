import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  @IsOptional()
  breed?: string;
}
