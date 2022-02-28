import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EmailVerification } from 'src/entities/email_verification/email_verification.entity';
import { ResponseDto } from 'src/dto/response.dto';
import { Profile } from 'src/entities/profile/profile.entity';
import { ProfileService } from 'src/profile/profile.service';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';
import { UserCredentialDto } from './dto/user-credential.dto';
import { User } from '../entities/user/user.entity';
import { UserRepository } from '../entities/user/user.repository';
import { ProfileRepository } from 'src/entities/profile/profile.repository';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	// 유저 찾기
	async getUserByIdx(idx: number): Promise<User> {
		return await this.userRepository.findOne({ idx });
	}

	async getUserByEmail(email: string): Promise<User> {
		return await this.userRepository.findOne({ email: email });
	}

	// 유저 카운트
	async getUserCountByEmail(email: string): Promise<number> {
		return await this.userRepository.count({ email });
	}

	// 유저 만들기
	async createUser(userCredentialDto: UserCredentialDto, emailVerification: EmailVerification): Promise<ResponseDto> {
		const user: User = await this.userRepository.createUser(userCredentialDto, emailVerification);

		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, { user });
	}

	// 임시 비밀번호 생성
	// 보안이슈 있을 수 있음
	async createTemporaryPassword(user: User): Promise<string> {
		return await this.userRepository.createTemporaryPassword(user);
	}
}
