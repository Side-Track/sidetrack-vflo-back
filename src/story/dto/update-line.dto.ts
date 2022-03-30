import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateLineDto {
	@IsNotEmpty()
	id: number;

	@IsBoolean()
	isLinked: boolean;

	@IsString()
	text: string;
}
