import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChoiceObjectDto {
	@IsNotEmpty()
	@IsNumber()
	linkedSceneId: number;

	@IsNotEmpty()
	text: string;
}
