import { IsInt, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateStoryDto {
	@IsNotEmpty()
	@MaxLength(20)
	@MinLength(1)
	title: string;

	@IsNotEmpty()
	@MaxLength(255)
	description: string;

	@IsInt({ each: true })
	genre_list: number[];
}
