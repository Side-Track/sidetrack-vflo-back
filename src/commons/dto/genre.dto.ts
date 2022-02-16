import { IsNotEmpty } from 'class-validator';

export class GenreDto {
	@IsNotEmpty()
	id: number;

	@IsNotEmpty()
	name: string;
}
