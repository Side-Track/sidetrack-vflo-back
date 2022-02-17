import { Injectable } from '@nestjs/common';
import { UserCredentialDto } from './dto/user-credential.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	// 유저 찾기
	async getUserByidx(idx: number): Promise<User> {
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
	async createUser(userCredentialDto: UserCredentialDto): Promise<User> {
		return await this.userRepository.createUser(userCredentialDto);
	}

	// 임시 비밀번호 생성
	// 보안이슈 있을 수 있음
	async createTemporaryPassword(user: User): Promise<string> {
		return await this.userRepository.createTemporaryPassword(user);
	}
}
