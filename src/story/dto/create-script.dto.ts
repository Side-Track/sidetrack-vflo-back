import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { CreateChoiceObjectDto } from './create-choice-object.dto';

class ChoiceObject {
	@IsNotEmpty()
	@IsNumber()
	linkedSceneId: number;

	@IsNotEmpty()
	text: string;
}

export class CreateScriptDto {
	@IsNotEmpty()
	@IsNumber()
	storyId: number;

	@IsNotEmpty()
	@IsNumber()
	sceneId: number;

	@IsNotEmpty()
	isChoice: boolean;

	@ValidateNested()
	@Type(() => ChoiceObject)
	choiceObjectList: ChoiceObject[];
}
