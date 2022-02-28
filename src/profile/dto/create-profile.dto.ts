import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class CreateProfileDto {
	@MaxLength(10)
	nickname: string;

	@MaxLength(150)
	bio: string;
}
