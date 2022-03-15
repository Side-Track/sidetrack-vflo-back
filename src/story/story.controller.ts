import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseDto } from 'src/dto/response.dto';
import { User } from 'src/entities/user/user.entity';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { CreateStoryDto } from './dto/create-stroy.dto';
import { StoryService } from './story.service';

@Controller('story')
export class StoryController {
	constructor(private storyService: StoryService) {}

	@Get('/get_story')
	@UseGuards(AuthGuard())
	getStory(@Body('id') id: number) {
		return this.storyService.getStory(id);
	}

	@Post('/post_story')
	@UseGuards(AuthGuard())
	postStory(@GetUser() user: User, createStoryDto: CreateStoryDto): Promise<ResponseDto> {
		return this.storyService.postStory(user, createStoryDto);
	}
}
