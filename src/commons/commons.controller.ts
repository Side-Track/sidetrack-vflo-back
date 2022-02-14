import { Controller, Get, Req } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { CommonsService } from './commons.service';

@Controller('commons')
export class CommonsController {
	constructor(private commonService: CommonsService) {}

	@Get('/get_all_genre_list')
	getAllGenreList(@Req() req): Promise<ResponseDto> {
		return this.commonService.getAllGenreList();
	}
}
