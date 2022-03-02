import { Body, Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/entities/user/user.entity';
import { ResponseDto } from 'src/dto/response.dto';
import { CommonsService } from './commons.service';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { v4 as uuid } from 'uuid';

// AWS S3
AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_ID,
	secretAccessKey: process.env.AWS_ACCESS_KEY,
	region: process.env.AWS_S3_REGION,
});
const s3 = new AWS.S3();

@Controller('commons')
export class CommonsController {
	constructor(private commonService: CommonsService) {}

	@Post('/file_upload')
	@UseGuards(AuthGuard)
	@UseInterceptors(
		FilesInterceptor('file', 10, {
			storage: multerS3({
				s3: s3,
				bucket: process.env.AWS_S3_BUCKET_NAME,
				acl: 'public-read',
				key: function (request, file, cb) {
					cb(null, `${uuid()}-${file.originalname}`);
				},
			}),
			limits: {},
		}),
	)
	uploadFile(@UploadedFiles() files: multerS3.File[]): Promise<ResponseDto> {
		return this.commonService.uploadFiles(files);
	}

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
