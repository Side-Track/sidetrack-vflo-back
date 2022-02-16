import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { Connection } from 'typeorm';
import { GenreRepository } from './repositories/genre.repository';
import { ResponseCode } from 'src/response.code.enum';
import { GenreDto } from './dto/genre.dto';
import { User } from 'src/auth/entities/user.entity';
import { ResponseMessage } from 'src/response.message.enum';

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

		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, `Request Succeed`, { genreList: list });
	}

	async createGenre(user: User, name: string): Promise<ResponseDto> {
		// 관리자인지 확인
		if (!user.is_admin) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.UNAUTHORIZED,
					ResponseCode.UNAUTHORIZED_USER,
					true,
					ResponseMessage.UNAUTHORIZED_USER,
				),
				HttpStatus.UNAUTHORIZED,
			);
		}

		// 중복 장르 있는지 확인
		const existGenre = await this.genreRepository.findOne({ name });

		if (existGenre) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.CONFLICT,
					ResponseCode.ALREADY_EXIST_GENRE,
					true,
					ResponseMessage.ALREADY_EXIST_GENRE,
					{ existGenre },
				),
				HttpStatus.CONFLICT,
			);
		}

		// 없으면 새로운 장르 만들기
		const genre = await this.genreRepository.insertGenre(name);

		// 만들기 실패
		if (!genre) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.ETC,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 만들기 성공
		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, `create new genre : ${name}`, {
			genre,
		});
	}
}
