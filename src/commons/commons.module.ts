import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonsController } from './commons.controller';
import { CommonsService } from './commons.service';
import { GenreRepository } from '../entities/common_genre/genre.repository';
import { S3 } from 'aws-sdk';
import { UploadFileRepository } from 'src/entities/common_upload-file/upload_file.repository';

@Module({
	imports: [TypeOrmModule.forFeature([GenreRepository, UploadFileRepository]), AuthModule],
	controllers: [CommonsController],
	providers: [CommonsService],
	exports: [CommonsService],
})
export class CommonsModule {}
