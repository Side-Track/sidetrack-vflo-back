import { ConflictException, HttpException, HttpStatus, InternalServerErrorException, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { EntityRepository, Repository } from 'typeorm';
import { UserCredentialDto } from '../dto/user-credential.dto';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import authPolicy from '../auth.policy';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
	// 유저 생성
	async createUser(userCredentialDto: UserCredentialDto): Promise<User> {
		const { email, password } = userCredentialDto;

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = this.create({ email: email, password: hashedPassword });

		try {
			return await this.save(user);
		} catch (err) {
			//  이미 같은것이 존재할 때 (Unique field 에 같은게 들어가려고 할 때)
			if (err.code === 'ER_DUP_ENTRY') {
				throw new HttpException(
					new ResponseDto(
						HttpStatus.CONFLICT,
						ResponseCode.ALREADY_REGISTERED_USER,
						true,
						ResponseMessage.ALREADY_REGISTERED_USER,
					),
					HttpStatus.CONFLICT,
				);
			}

			// 기타 서버 에러
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async createTemporaryPassword(user: User): Promise<string> {
		// 임시비밀번호 생성
		let password = '';

		// 임시 비밀번호 최소 길이는 8자
		while (password.length < authPolicy.TemporaryPasswordLength) {
			password = Math.random().toString(36).slice(2);
		}

		// 임시 비밀번호 설정, 해시
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		user.password = hashedPassword;

		try {
			// DB에 업데이트
			await this.save(user);
			return password;
		} catch (err) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// 모든 유저 가져오기
	async selectAllUsers(): Promise<User[]> {
		const userList = this.find();
		return userList;
	}
}
