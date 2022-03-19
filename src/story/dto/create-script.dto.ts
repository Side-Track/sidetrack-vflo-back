import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { ChoiceObjectDto } from './choice-object.dto';
import { CreateChoiceObjectDto } from './create-choice-object.dto';
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
	@Type(() => ChoiceObjectDto)
	choiceObjectList: ChoiceObjectDto[];
}
