import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	UploadedFile,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseDto } from 'src/dto/response.dto';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { v4 as uuid } from 'uuid';
import { User } from 'src/entities/user/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/image-file.filter';

// AWS S3
AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_ID,
	secretAccessKey: process.env.AWS_ACCESS_KEY,
	region: process.env.AWS_S3_REGION,
});
const s3 = new AWS.S3();

@Controller('profile')
@UseGuards(AuthGuard())
export class ProfileController {
	constructor(private profileService: ProfileService) {}

	@Get('/check_nickname')
	checkNickname(@Body('nickname') nickname: string, @Body('recommend') recommend: boolean): Promise<ResponseDto> {
		return this.profileService.checkDuplicateNickname(nickname, recommend);
	}

	@Post('/create_profile')
	@UsePipes(ValidationPipe)
	createProfile(@GetUser() user, @Body() createProfileDto: CreateProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx
		const requsetUserIdx = user.idx;
		return this.profileService.createProfile(requsetUserIdx, createProfileDto);
	}

	@Post('/update_profile')
	@UsePipes(ValidationPipe)
	@UseInterceptors(
		FileInterceptor('profile_image', {
			storage: multerS3({
				s3: s3,
				bucket: process.env.AWS_S3_BUCKET_NAME,
				acl: 'public-read',
				key: function (request, file, cb) {
					cb(null, `${uuid()}-${file.originalname}`);
				},
			}),
			fileFilter: imageFileFilter,
		}),
	)
	updateProfile(
		@GetUser() user,
		@Body() createProfileDto: CreateProfileDto,
		@UploadedFile() profileImage: multerS3.File,
	): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx
		const requsetUserIdx = user.idx;
		createProfileDto.profileImage = profileImage;
		return this.profileService.updateProfile(requsetUserIdx, createProfileDto);
	}

	@UseInterceptors(
		FileInterceptor('profile_image', {
			storage: multerS3({
				s3: s3,
				bucket: process.env.AWS_S3_BUCKET_NAME,
				acl: 'public-read',
				key: function (request, file, cb) {
					cb(null, `${uuid()}-${file.originalname}`);
				},
			}),
			fileFilter: imageFileFilter,
		}),
	)
	@Post('/update_profile_image')
	updateProfileImage(@GetUser() user: User, @UploadedFile() file: multerS3.File): Promise<ResponseDto> {
		return this.profileService.updateProfileImage(user, file);
	}
}
