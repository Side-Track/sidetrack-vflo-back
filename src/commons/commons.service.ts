import { Injectable } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { Connection } from 'typeorm';
import { GenreRepository } from './repositories/genre.repository';
import Constant from 'src/response.constant';
import { ResponseCode } from 'src/response.code.enum';
import { GenreDto } from './dto/genre.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class CommonsService {
	private genreRepository: GenreRepository;
	constructor(private readonly connection: Connection) {
		this.genreRepository = this.connection.getCustomRepository(GenreRepository);
	}

	async getAllGenreList() {
		const list = await this.genreRepository.find();

		if (list.length == 0) {
			return new ResponseDto(
				Constant.HttpStatus.DATA_NOT_FOUND,
				ResponseCode.DATA_NOT_FOUND,
				true,
				`Can't find any genre.`,
			);
		}

		return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.SUCCESS, false, `Request Succeed`, { genreList: list });
	}

	async createGenre(user: User, name: string): Promise<ResponseDto> {
		// 관리자인지 확인
		if (!user.is_admin) {
			return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.UNAUTHORIZED_USER, true, 'un-authorized user.');
		}

		// 중복 장르 있는지 확인
		const existGenre = await this.genreRepository.findOne({ name });

		if (existGenre) {
			return new ResponseDto(
				Constant.HttpStatus.OK,
				ResponseCode.ALREADY_EXIST_GENRE,
				true,
				`${name} is aleady exist genre`,
				{ existGenre },
			);
		}

		// 없으면 새로운 장르 만들기
		const genre = await this.genreRepository.insertGenre(name);

		// 만들기 실패
		if (!genre) {
			return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.ETC, true, 'create new genre is failed');
		}

		// 만들기 성공
		return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.SUCCESS, false, `create new genre : ${name}`, {
			genre,
		});
	}
}
