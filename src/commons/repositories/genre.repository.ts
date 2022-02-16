import { ConflictException, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';
import { EntityRepository, Repository } from 'typeorm';
import { GenreDto } from '../dto/genre.dto';
import { Genre } from '../entities/genre.entity';

@EntityRepository(Genre)
export class GenreRepository extends Repository<Genre> {
	async insertGenre(name: string): Promise<Genre> {
		const genre = this.create({ name });

		try {
			await this.save(genre);
		} catch (err) {
			if (err.code === 'ER_DUP_ENTRY') {
				throw new HttpException(
					new ResponseDto(
						HttpStatus.INTERNAL_SERVER_ERROR,
						ResponseCode.ETC,
						true,
						ResponseMessage.INTERNAL_SERVER_ERROR,
					),
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			} else {
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
		}

		return genre;
	}
}
