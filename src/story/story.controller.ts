import { Body, Controller, Delete, Get, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { userInfo } from 'os';
import { ResponseDto } from 'src/dto/response.dto';
import { User } from 'src/entities/user/user.entity';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { CreateChoiceObjectDto } from './dto/create-choice-object.dto';
import { CreateLineDto } from './dto/create-line.dto';
import { CreateScriptDto } from './dto/create-script.dto';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateLineDto } from './dto/update-line.dto';
import { UpdateStoryGenrePairDto } from './dto/update-story-genre-pair-list.dto';
import { StoryService } from './story.service';

@Controller('story')
export class StoryController {
	constructor(private storyService: StoryService) {}

	@Get('/get_story')
	@UseGuards(AuthGuard())
	getStory(@Body('id') id: number) {
		return this.storyService.getStory(id);
	}

	@Post('/create_story')
	@UseGuards(AuthGuard())
	@UsePipes(ValidationPipe)
	postStory(@GetUser() user: User, @Body() createStoryDto: CreateStoryDto): Promise<ResponseDto> {
		return this.storyService.createStory(user, createStoryDto);
	}

	@Patch('/update_story_genre_list')
	@UseGuards(AuthGuard())
	@UsePipes(ValidationPipe)
	updateStoryGenreList(
		@GetUser() user: User,
		@Body() updateStoryGenrePairDto: UpdateStoryGenrePairDto,
	): Promise<ResponseDto> {
		return this.storyService.updateStoryGenre(user, updateStoryGenrePairDto);
	}

	@Post('/create_scene')
	@UseGuards(AuthGuard())
	createScene(@GetUser() user: User, @Body('storyId') storyId: number): Promise<ResponseDto> {
		return this.storyService.createScene(user, storyId);
	}

	@Delete('/delete_scene')
	@UseGuards(AuthGuard())
	deleteScene(
		@GetUser() user: User,
		@Body('storyId') storyId: number,
		@Body('sceneId') sceneId: number,
	): Promise<ResponseDto> {
		return this.storyService.deleteScene(user, storyId, sceneId);
	}

	@Post('/create_script')
	@UseGuards(AuthGuard())
	@UsePipes(ValidationPipe)
	createScript(@GetUser() user: User, @Body() createScriptDto: CreateScriptDto): Promise<ResponseDto> {
		return this.storyService.createScript(user, createScriptDto);
	}

	@Delete('/delete_script')
	@UseGuards(AuthGuard())
	deleteScript(
		@GetUser() user: User,
		@Body('storyId') storyId: number,
		@Body('sceneId') sceneId: number,
		@Body('scriptId') scriptId: number,
	): Promise<ResponseDto> {
		return this.storyService.deleteScript(user, storyId, sceneId, scriptId);
	}

	@Post('/create_choice_object')
	@UseGuards(AuthGuard())
	@UsePipes(ValidationPipe)
	createChoiceObject(
		@GetUser() user: User,
		@Body() createChoiceObjectDto: CreateChoiceObjectDto,
	): Promise<ResponseDto> {
		return this.storyService.createChoiceObject(user, createChoiceObjectDto);
	}

	@Post('/create_line')
	@UseGuards(AuthGuard())
	@UsePipes(ValidationPipe)
	createLine(@GetUser() user: User, @Body() createLineDto: CreateLineDto): Promise<ResponseDto> {
		return this.storyService.createLine(user, createLineDto);
	}

	@Delete('/delete_line')
	@UseGuards(AuthGuard())
	deleteLine(@GetUser() user: User, @Body('lineId') lineId: number): Promise<ResponseDto> {
		return this.storyService.deleteLine(user, lineId);
	}

	@Patch('/update_line')
	@UseGuards(AuthGuard())
	updateLine(@GetUser() user: User, @Body() updateLineDto: UpdateLineDto): Promise<ResponseDto> {
		return this.storyService.updateLine(user, updateLineDto);
	}
}
