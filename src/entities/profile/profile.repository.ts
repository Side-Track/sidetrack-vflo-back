import { HttpException, HttpStatus, InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from 'src/entities/user/user.entity';
import { ResponseDto } from 'src/dto/response.dto';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { ProfileDto } from '../../profile/dto/profile.dto';
import { Profile } from './profile.entity';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';
import { CreateProfileDto } from '../../profile/dto/create-profile.dto';
import { UploadFile } from '../common_upload-file/upload_file.entity';

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

	async createProfile(user: User, createProfileDto: CreateProfileDto): Promise<Profile> {
		// 요청에서 닉네임과 바이오 가져오기
		let { nickname, bio } = createProfileDto;

		// 닉네임 중복인지 확인
		const count = await this.count({ nickname });
		if (count > 0) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.CONFLICT,
					ResponseCode.ALREADY_EXIST_NICKNAME,
					true,
					ResponseMessage.ALREADY_EXIST_NICKNAME,
				),
				HttpStatus.CONFLICT,
			);
		}

		// 프로필 만들기
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();
		try {
			let profile = this.create({ user, nickname, bio });

			const createdProfile = await this.save(profile);

			await queryRunner.commitTransaction();
			Logger.log(`User ${user.idx} upload profile generated`);
			return createdProfile;
		} catch (err) {
			// rollback
			await queryRunner.rollbackTransaction();

			// 이미 같은것이 존재할 때 (Unique field 에 같은게 들어가려고 할 때)
			if (err.code === 'ER_DUP_ENTRY') {
				throw new HttpException(
					new ResponseDto(
						HttpStatus.CONFLICT,
						ResponseCode.ALREADY_USER_PROFILE_EXIST,
						true,
						ResponseMessage.ALREADY_USER_PROFILE_EXIST,
					),
					HttpStatus.CONFLICT,
				);
			}

			// 기타 에러
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		} finally {
			await queryRunner.release();
		}
	}

	async updateProfile(user: User, createProfileDto: CreateProfileDto): Promise<ResponseDto> {
		// 요청에서 닉네임과 바이오 가져오기
		const { nickname, bio, profileImage } = createProfileDto;

		// 프로필 찾기
		let profile = await this.findOne({ user: user });

		// 없으면 에러
		if (!profile) {
			throw new HttpException(
				new ResponseDto(HttpStatus.NO_CONTENT, ResponseCode.DATA_NOT_FOUND, true, ResponseMessage.DATA_NOT_FOUND),
				HttpStatus.NOT_FOUND,
			);
		}

		// 프로필 기본 정보 프로필 객체에 매핑
		profile.nickname = nickname;
		profile.bio = bio;
		if (profileImage != undefined) {
			profile.profile_image_url = profileImage.location;
		}

		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try {
			profile = await this.save(profile);

			await queryRunner.commitTransaction();

			// 로깅 및 리턴
			Logger.log(`User ${user.idx} upload profile`);
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '프로필이 업데이트 되었습니다.', { profile });
		} catch (err) {
			// rollback
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
					err,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		} finally {
			await queryRunner.release();
		}
	}

	async getProfile(userIdx: number) {}
}
