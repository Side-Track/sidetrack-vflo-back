import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ResponseDto } from 'src/dto/response.dto';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';
import { Connection } from 'typeorm';
import { User } from '../entities/user/user.entity';
import { UserRepository } from '../entities/user/user.repository';

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
			throw new HttpException(
				new ResponseDto(
					HttpStatus.UNAUTHORIZED,
					ResponseCode.UNAUTHORIZED_USER,
					true,
					ResponseMessage.UNAUTHORIZED_USER,
				),
				HttpStatus.UNAUTHORIZED,
			);
		}

		// requset 에 user객체 넣을 때 비밀번호는 빼고 넣음
		delete user.password;

		return user;
	}
}
