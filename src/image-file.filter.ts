import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseDto } from './dto/response.dto';
import { ResponseCode } from './response.code.enum';
import { ResponseMessage } from './response.message.enum';

export const imageFileFilter = (req, file, callback) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		return callback(
			new HttpException(
				new ResponseDto(
					HttpStatus.BAD_REQUEST,
					ResponseCode.IS_NOT_IMAGE_FILE,
					true,
					ResponseMessage.IS_NOT_IMAGE_FILE,
				),
				HttpStatus.BAD_REQUEST,
			),
			false,
		);
	}
	callback(null, true);
};
