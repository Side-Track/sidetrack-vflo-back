import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { ResponseCode } from 'src/response.code.enum';

class GlobalEmptyStringValidationPipe implements PipeTransform {
	transform(value: string) {
		if (value.length == 0 || value.replace(/\s/g, '') == '' || !value) {
			throw new BadRequestException(`string value is empty`);
		}

		return value;
	}
}

export default {
	GlobalEmptyStringValidationPipe: GlobalEmptyStringValidationPipe,
};
