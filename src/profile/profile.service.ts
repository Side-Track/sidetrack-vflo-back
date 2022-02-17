import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { ResponseDto } from 'src/dto/response.dto';
import { Connection } from 'typeorm';
import { ProfileDto } from './dto/profile.dto';
import { ProfileRepository } from './repositories/profile.repository';

import { ResponseCode } from 'src/response.code.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseMessage } from 'src/response.message.enum';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
	constructor(
		private profileRepository: ProfileRepository,

		// ProfileService 는 UserService 참조함. 순환참조 제거하기 위한 방법
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
	) {}

	// 닉네임 중복체크
	async checkDuplicateNickname(nickname: string, recommend: boolean): Promise<ResponseDto> {
		// 닉네임이 빈 문자열인지 체크
		if (nickname.length == 0 || !nickname || nickname.replace(/\s/g, '') == '') {
			throw new HttpException(
				new ResponseDto(HttpStatus.BAD_REQUEST, ResponseCode.ETC, true, ResponseMessage.BAD_REQUEST),
				HttpStatus.BAD_REQUEST,
			);
		}

		// similar 로 찾는 이유 : 추천기능이 입력한 닉네임 베이스로 생성하므로 LIKE 검색으로 입력한 닉네임이 포함된 모든 닉네임을 검색함.
		const existNicknameObj = await this.profileRepository.searchSimilarNickname(nickname);
		let responseData = {};

		// 추천을 받을 경우
		if (recommend) {
			let recommendList = [];

			// 10개 정도 생성(숫자 붙여서)
			for (let i = 1; i <= 10; i++) {
				let tempNickname = nickname + Math.floor(Math.random() * 101);

				if (!existNicknameObj[tempNickname] && !recommendList[tempNickname]) {
					recommendList.push(tempNickname);
				}
			}

			responseData['recommendList'] = recommendList;
		}

		// 사용불가능한 닉네임인 경우
		if (existNicknameObj[nickname] != undefined) {
			responseData['isUnique'] = false;
			throw new HttpException(
				new ResponseDto(
					HttpStatus.CONFLICT,
					ResponseCode.ALREADY_EXIST_NICKNAME,
					false,
					ResponseMessage.ALREADY_EXIST_NICKNAME,
				),
				HttpStatus.CONFLICT,
			);
		}

		// 사용가능한 닉네임일 경우
		responseData['isUnique'] = true;
		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '사용가능한 닉네임입니다.', responseData);
	}

	// 명시적 프로필 생성 (회원가입 시 자동생성 안할 경우 명시적으로 생성)
	async explicitCreateProfile(requsetUserIdx: number, profileDto: ProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx 로 유저 찾음
		const user: User = await this.userService.getUserByIdx(requsetUserIdx);

		// 유저 없으면 에러
		if (!user) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.NOT_FOUND,
					ResponseCode.NOT_REGISTERED_USER,
					true,
					ResponseMessage.NOT_REGISTERED_USER,
				),
				HttpStatus.NOT_FOUND,
			);
		}

		// 프로필 생성
		const profile = await this.profileRepository.createProfile(user, profileDto);

		// 생성 후 모종의 이유로 없으면 에러던짐
		if (!profile) {
			throw new HttpException(
				new ResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, ResponseCode.ETC, true, ResponseMessage.ETC),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 프로필 리턴
		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '프로필이 성공적으로 생성되었습니다.', {
			profile,
		});
	}

	// 프로필 생성 (회원가입 시 자동생성에 사용 중)
	async createProfile(user: User): Promise<Profile> {
		// 프로필 생성
		const profile = await this.profileRepository.createProfile(user, new ProfileDto());

		// 생성 후 모종의 이유로 없으면 에러던짐
		if (!profile) {
			throw new HttpException(
				new ResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, ResponseCode.ETC, true, ResponseMessage.ETC),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		return profile;
	}

	// 프로필 업데이트
	async updateProfile(requsetUserIdx: number, profileDto: ProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx 로 유저 찾음
		const user: User = await this.userService.getUserByIdx(requsetUserIdx);

		// 유저 없으면 리턴
		if (!user) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.NOT_FOUND,
					ResponseCode.NOT_REGISTERED_USER,
					true,
					ResponseMessage.NOT_REGISTERED_USER,
				),
				HttpStatus.NO_CONTENT,
			);
		}

		return await this.profileRepository.updateProfile(user, profileDto);
	}
}
