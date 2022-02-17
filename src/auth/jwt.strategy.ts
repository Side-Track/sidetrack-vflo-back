import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Connection } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserRepository } from '../user/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	private userRepository: UserRepository;
	constructor(private readonly connection: Connection) {
		super({
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		});

		this.userRepository = this.connection.getCustomRepository(UserRepository);
	}

	async validate(payload) {
		const { userIdx } = payload;
		const user: User = await this.userRepository.findOne({ idx: userIdx });

		if (!user) {
			throw new UnauthorizedException();
		}

		// requset 에 user객체 넣을 때 비밀번호는 빼고 넣음
		delete user.password;

		return user;
	}
}
