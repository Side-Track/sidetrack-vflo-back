import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { EntityRepository, Repository } from 'typeorm';
import { UserCredentialDto } from './dto/user-credential.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import authPolicy from './auth.policy';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
	// 유저 생성
	async createUser(userCredentialDto: UserCredentialDto): Promise<User> {
		const { email, password } = userCredentialDto;

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = this.create({ email: email, password: hashedPassword });

		try {
			await this.save(user);
			return user;
		} catch (err) {
			if (err.code === 'ER_DUP_ENTRY') {
				throw new ConflictException('Already existing user name');
			}

			throw new InternalServerErrorException('Internal Server Error is occured. Plz contact administartor.');
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
			Logger.warn(err);
			throw new InternalServerErrorException('Internal Server Error is occured. Plz contact administartor.');
		}
	}

	// 모든 유저 가져오기
	async selectAllUsers(): Promise<User[]> {
		const userList = this.find();
		return userList;
	}
}
