import { Body, Controller, Get, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseDto } from 'src/dto/response.dto';
import { User } from 'src/entities/user/user.entity';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { CreateScriptDto } from './dto/create-script.dto';
import { CreateStoryDto } from './dto/create-story.dto';
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
		return this.storyService.postStory(user, createStoryDto);
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
		return this.storyService.insertScene(user, storyId);
	}

	@Post('/delete_scene')
	@UseGuards(AuthGuard())
	deleteScene(@GetUser() user: User, storyId: number, sceneId: number): Promise<ResponseDto> {
		return this.storyService.deleteSecene(user, storyId, sceneId);
	}

	@Post('/create_script')
	@UseGuards(AuthGuard())
	createScript(@GetUser() user: User, @Body() createScriptDto: CreateScriptDto): Promise<ResponseDto> {
		return this.storyService.insertScript(user, createScriptDto);
	}
}
