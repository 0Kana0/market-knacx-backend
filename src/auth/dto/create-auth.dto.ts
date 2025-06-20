import { IsString, IsNotEmpty, IsNumber, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string
}

