import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLineDto {
	@IsNotEmpty()
	@IsNumber()
	storyId: number;

	@IsNotEmpty()
	@IsNumber()
	sceneId: number;

	@IsNotEmpty()
	@IsNumber()
	scriptId: number;

	@IsNotEmpty()
	@IsString()
	text: string;

	// assest, effect

	@IsNotEmpty()
	@IsBoolean()
	isLinked: boolean;
}
