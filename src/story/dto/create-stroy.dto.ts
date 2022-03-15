import { IsNotEmpty, isNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateStoryDto {
	@IsNotEmpty()
	@MaxLength(255)
	@MinLength(1)
	title: string;

	@MaxLength(255)
	description: string;

	genreList: number[];
}
