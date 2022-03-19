import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChoiceObjectDto {
	@IsNotEmpty()
	@IsString()
	text: string;

	@IsNotEmpty()
	@IsNumber()
	linkedSceneId: number;

	@IsNotEmpty()
	@IsNumber()
	scriptId: number;

	@IsNotEmpty()
	@IsNumber()
	sceneId: number;

	@IsNotEmpty()
	@IsNumber()
	storyId: number;
}
