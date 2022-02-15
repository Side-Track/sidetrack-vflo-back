import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { GenreDto } from '../dto/genre.dto';
import { Genre } from '../entities/genre.entity';

@EntityRepository(Genre)
export class GenreRepository extends Repository<Genre> {
	async insertGenre(name: string): Promise<Genre> {
		let genre = this.create({ name });

		try {
			genre = await this.save(genre);
			console.log(genre);
		} catch (err) {
			if (err.code === 'ER_DUP_ENTRY') {
				throw new ConflictException('Already existing user name');
			} else {
				throw new InternalServerErrorException('Internal Server error occured. Please contact Server Manager');
			}
		}

		return genre;
	}
}
