import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class ProfileDto {
	@IsNotEmpty()
	@IsNumber()
	userIdx: number;

	@MaxLength(10)
	nickname: string;

	@MaxLength(150)
	bio: string;
}
