import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ResponseDto } from 'src/dto/response.dto';
import { CommonsService } from './commons.service';

@Controller('commons')
export class CommonsController {
	constructor(private commonService: CommonsService) {}

	@Get('/get_all_genre')
	getAllGenreList(@Req() req): Promise<ResponseDto> {
		return this.commonService.getAllGenreList();
	}

	@Post('/create_genre')
	@UseGuards(AuthGuard())
	createGenre(@GetUser() user: User, @Body('name') name: string): Promise<ResponseDto> {
		return this.commonService.createGenre(user, name);
	}
}
