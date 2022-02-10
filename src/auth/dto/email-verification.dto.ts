import { IsAlphanumeric, IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class EmailVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsAlphanumeric()
  code: string;
}
