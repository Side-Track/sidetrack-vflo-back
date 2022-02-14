import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { UserRepository } from 'src/auth/user.repository';
import { ResponseDto } from 'src/dto/response.dto';
import { Connection } from 'typeorm';
import { ProfileDto } from './dto/profile.dto';
import { ProfileRepository } from './profile.repository';

import Constant from 'src/response.constant';
import { ResponseCode } from 'src/response.code.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProfileService {
	// Repository DI
	private userRepository: UserRepository;
	private profileRepository: ProfileRepository;
	constructor(private readonly connection: Connection) {
		this.userRepository = this.connection.getCustomRepository(UserRepository);
		this.profileRepository = this.connection.getCustomRepository(ProfileRepository);
	}

	// constructor(
	// 	@InjectRepository(UserRepository)
	// 	private userRepository: UserRepository,

	// 	@InjectRepository(ProfileRepository)
	// 	private profileRepository: ProfileRepository,
	// ) {}

	// 닉네임 중복체크
	async checkDuplicateNickname(nickname: string): Promise<ResponseDto> {
		const existNicknameObj = await this.profileRepository.searchSimilarNickname(nickname);

		if (existNicknameObj[nickname] == undefined) {
			return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.SUCCESS, false, 'nickname is available!', {
				isUnique: true,
			});
		}

		return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.SUCCESS, false, 'nickname is unavailable', {
			isUnique: false,
		});
	}

	// 프로필 생성
	async createProfile(requsetUserIdx: number, profileDto: ProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx 로 유저 찾음
		const user: User = await this.userRepository.findOne({ idx: requsetUserIdx });

		// 유저 없으면 리턴
		if (!user) {
			return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.NOT_REGISTERED_USER, true, 'Cannot find user');
		}

		// 프로필 생성
		const profile = await this.profileRepository.createProfile(user, profileDto);

		// 생성 후 모종의 이유로 없으면 에러던짐
		if (!profile) {
			throw new InternalServerErrorException('Internal Server Error is occured. Plz contact administartor.');
		}

		// 프로필 리턴
		return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.SUCCESS, false, 'Profile is created!', { profile });
	}

	// 프로필 업데이트
	async updateProfile(requsetUserIdx: number, profileDto: ProfileDto): Promise<ResponseDto> {
		console.log(requsetUserIdx);

		// 토큰으로 부터 받은 유저 idx 로 유저 찾음
		const user: User = await this.userRepository.findOne({ idx: requsetUserIdx });

		// 유저 없으면 리턴
		if (!user) {
			return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.NOT_REGISTERED_USER, true, 'Cannot find user');
		}

		return await this.profileRepository.updateProfile(user, profileDto);
	}
}
