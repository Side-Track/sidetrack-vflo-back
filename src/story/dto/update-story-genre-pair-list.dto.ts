import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class UpdateStoryGenrePairDto {
	@IsNotEmpty()
	@IsInt()
	storyId: number;

	@IsNotEmpty()
	@IsInt({ each: true })
	genre_list: number[];
}
