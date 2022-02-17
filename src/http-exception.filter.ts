import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from './dto/response.dto';
import { ResponseCode } from './response.code.enum';
import { ResponseMessage } from './response.message.enum';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		// HttpException이 아니라면 ETC 예외처리
		if (!(exception instanceof HttpException)) {
			// exception = new InternalServerErrorException();
			console.log(exception);
			exception = new HttpException(
				new ResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, ResponseCode.ETC, true, ResponseMessage.ETC),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		let response = (exception as HttpException).getResponse();

		// DTO, 또는 로직에서 자동으로 던진 에러일 경우(명시적으로 던진 에러가 아닌경우)
		if (response['statusCode']) {
			const messageList = response['message'];
			const statusCode = response['statusCode']; //HttpStatus Code
			let errorString = response['error']; //error string

			// errorString 을 resonseDto 에 넣기위해 컨벤션 맞추기
			errorString = errorString.toUpperCase().replaceAll(' ', '_');

			// 자동으로 던저진 에러의 메세지는 배열형식이므로 이것을 개행문자로 붙여줍니다.
			const message = messageList.join('\n');

			// responseDto 의 데이터 영역에 기존 에러의 리스폰스 객체를 넣어서 원문을 확인 할 수 있도록 합니다.
			const responseDto = new ResponseDto(statusCode, errorString, true, message, { response });

			response = responseDto;
		}

		const log = {
			timestamp: new Date(),
			url: req.url,
			response,
		};

		Logger.error(log);

		res.status((exception as HttpException).getStatus()).json(response);
	}
}
