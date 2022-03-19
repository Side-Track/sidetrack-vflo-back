import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ChoiceObjectDto } from './choice-object.dto';

export class CreateChoiceObjectDto {
	@ValidateNested()
	@Type(() => ChoiceObjectDto)
	choiceObjectList: ChoiceObjectDto[];

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
