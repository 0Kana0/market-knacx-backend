import { IsString, IsNotEmpty, IsNumber, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  id: number

  @IsOptional()
  @IsString()
  name: string

  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsString()
  @MinLength(8)
  c_password: string

  @IsOptional()
  createdAt: Date

  @IsOptional()
  updatedAt: Date
}

