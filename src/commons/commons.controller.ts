import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
	createGenre(@Req() req, @Body('name') name: string): Promise<ResponseDto> {
		return this.commonService.createGenre(req, name);
	}
}
