import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { Connection } from 'typeorm';
import { GenreRepository } from './repositories/genre.repository';
import Constant from 'src/response.constant';
import { ResponseCode } from 'src/response.code.enum';

@Injectable()
export class CommonsService {
	private genreRepository: GenreRepository;
	constructor(private readonly connection: Connection) {
		this.genreRepository = this.connection.getCustomRepository(GenreRepository);
	}

	async getAllGenreList() {
		const list = await this.genreRepository.find();
		// //  장르가 없을 때
		// if (list.length == 0) {
		// 	return new ResponseDto(
		// 		HttpStatus.NO_CONTENT,
		// 		ResponseCode.DATA_NOT_FOUND,
		// 		true,
		// 		`Can't find any genre.`,
		// 	);
		// }

		return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.SUCCESS, false, `Request Succeed`, { genreList: list });
	}
}
