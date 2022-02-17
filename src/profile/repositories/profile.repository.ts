import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { ResponseDto } from 'src/dto/response.dto';
import { EntityRepository, Repository } from 'typeorm';
import { ProfileDto } from '../dto/profile.dto';
import { Profile } from '../entities/profile.entity';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';

@EntityRepository(Profile)
export class ProfileRepository extends Repository<Profile> {
	async searchSimilarNickname(nickname: string): Promise<object> {
		// 요청 온 문자열이 포함된 모든 닉네임 검색
		const query = this.createQueryBuilder('profile')
			.select('profile.nickname')
			.where('profile.nickname LIKE :nickname', { nickname: `%${nickname}%` });

		const existNicknameList = await query.getRawMany();

		// 검색된 모든 닉네임으로 맵 생성
		const existNicknameMap = {};

		if (existNicknameList.length > 0) {
			for (let i in existNicknameList) {
				const existNickname = existNicknameList[i].profile_nickname;

				existNicknameMap[existNickname] = existNickname;
			}
		}

		return existNicknameMap;
	}

	async createProfile(user: User, profileDto: ProfileDto): Promise<Profile> {
		// 요청에서 닉네임과 바이오 가져오기
		let { nickname, bio } = profileDto;

		// 닉네임이 비었을 경우 이메일에서 가져옴
		nickname = nickname == undefined ? user.email.split('@')[0] : nickname;

		// 프로필 만들기
		let profile = this.create({ user, nickname, bio });

		try {
			return await this.save(profile);
		} catch (err) {
			// 에러던지기
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

	async updateProfile(user: User, profileDto: ProfileDto): Promise<ResponseDto> {
		// 요청에서 닉네임과 바이오 가져오기
		const { nickname, bio } = profileDto;

		// 프로필 찾기
		let profile = await this.findOne({ user: user });

		// 없으면 에러
		if (!profile) {
			// 없으면 생성해서 리턴
			// const newProfile = this.createProfile(user, profileDto);
			// return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'Profile is Updated!', {newProfile});

			throw new HttpException(
				new ResponseDto(HttpStatus.NO_CONTENT, ResponseCode.DATA_NOT_FOUND, true, ResponseMessage.DATA_NOT_FOUND),
				HttpStatus.NOT_FOUND,
			);
		}

		profile.nickname = nickname;
		profile.bio = bio;

		try {
			profile = await this.save(profile);

			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '프로필이 업데이트 되었습니다.', { profile });
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

	async getProfile(userIdx: number) {}
}