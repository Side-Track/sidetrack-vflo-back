import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonsController } from './commons.controller';
import { CommonsService } from './commons.service';
import { GenreRepository } from '../entities/common_genre/genre.repository';

@Module({
	imports: [TypeOrmModule.forFeature([GenreRepository]), AuthModule],
	controllers: [CommonsController],
	providers: [CommonsService],
})
export class CommonsModule {}
