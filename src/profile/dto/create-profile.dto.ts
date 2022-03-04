import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';
import { UploadFile } from 'src/entities/common_upload-file/upload_file.entity';
import * as multerS3 from 'multer-s3';

export class CreateProfileDto {
	@MaxLength(10)
	nickname: string;

	@MaxLength(150)
	bio: string;

	profileImage: multerS3.File;
}
