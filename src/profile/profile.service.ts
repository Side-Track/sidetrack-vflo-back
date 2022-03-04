import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { User } from 'src/entities/user/user.entity';
import { UserRepository } from 'src/entities/user/user.repository';
import { ResponseDto } from 'src/dto/response.dto';
import { Connection } from 'typeorm';
import { ProfileDto } from './dto/profile.dto';
import { ProfileRepository } from '../entities/profile/profile.repository';

import { ResponseCode } from 'src/response.code.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseMessage } from 'src/response.message.enum';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Profile } from '../entities/profile/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';

import * as multerS3 from 'multer-s3';
import { UploadFile } from 'src/entities/common_upload-file/upload_file.entity';
import { UploadFileRepository } from 'src/entities/common_upload-file/upload_file.repository';

@Injectable()
export class ProfileService {
	constructor(
		private readonly profileRepository: ProfileRepository,
		private readonly userService: UserService, // private readonly userRepository: UserRepository,
		private readonly uploadFileRepository: UploadFileRepository,
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

				// 이미 추천 목록에 있거나, 존재하는 닉네임이 아니면 추천목록에 추가
				if (!existNicknameObj[tempNickname] && !recommendList[tempNickname]) {
					recommendList.push(tempNickname);
				}
			}

			responseData['recommendList'] = recommendList;
		}

		// 사용불가능한 닉네임인 경우
		if (existNicknameObj[nickname] != undefined) {
			responseData['isUnique'] = false;
			return new ResponseDto(
				HttpStatus.CONFLICT,
				ResponseCode.ALREADY_EXIST_NICKNAME,
				false,
				ResponseMessage.ALREADY_EXIST_NICKNAME,
				responseData,
			);
		}

		// 사용가능한 닉네임일 경우
		responseData['isUnique'] = true;
		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '사용가능한 닉네임입니다.', responseData);
	}

	// 프로필 생성 (회원가입 시 자동생성에 사용 중)
	async createProfile(requsetUserIdx: number, createProfileDto: CreateProfileDto): Promise<ResponseDto> {
		const user: User = await this.userService.getUserByIdx(requsetUserIdx);

		// 프로필 DTO
		let tempProfileDto: CreateProfileDto = undefined;

		if (createProfileDto.nickname != undefined || createProfileDto.bio != undefined) {
			tempProfileDto = createProfileDto;
		} else {
			tempProfileDto = new CreateProfileDto();

			// 닉네임 이메일에서 가져옴
			const nickname = user.email;

			// 이메일로 부터 가져온 닉네임을 중복검사 및 추천받음
			const responseDto: ResponseDto = await this.checkDuplicateNickname(nickname, true);
			const isUnique: boolean = responseDto.data['isUnique'];
			const recommendList: string[] = responseDto.data['recommendList'];

			// 중복이 아니라면
			if (isUnique) {
				tempProfileDto.nickname = nickname;
			} else {
				// 중복이라면
				// 추천 닉네임 배열을 검사
				if (recommendList.length > 0) {
					// 난수 인덱스를 만들되, 범위는 0 ~ 추천배열의 크기보다 1 작아야 함.
					let randomIndex = Math.floor(Math.random() * recommendList.length);
					// 추천 배열로 부터 임시 프로필 닉네임 지정
					tempProfileDto.nickname = recommendList[randomIndex];
				}
			}
		}

		const profile: Profile = await this.profileRepository.createProfile(user, tempProfileDto);
		const profileDto: ProfileDto = new ProfileDto(profile.user.idx, profile.nickname, profile.bio);

		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'OK', profileDto);
	}

	// 프로필 업데이트
	async updateProfile(requsetUserIdx: number, createProfileDto: CreateProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx 로 유저 찾음
		const user: User = await this.userService.getUserByIdx(requsetUserIdx);
		const profileImage = createProfileDto.profileImage;
		const nickname = createProfileDto.nickname;

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

		// 중복 닉네임
		const duplicateNicknameCount = await this.profileRepository.count({ nickname });
		if (duplicateNicknameCount > 0) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.ALREADY_EXIST_NICKNAME,
					true,
					ResponseMessage.ALREADY_EXIST_NICKNAME,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 프로필 이미지 파일 객체 매핑
		let file = undefined;
		if (profileImage != undefined) {
			file = new UploadFile();
			file.originalName = profileImage.originalname;
			file.mimeType = profileImage.mimetype;
			file.size = profileImage.size;
			file.url = profileImage.location;
		}

		try {
			// 프로필 이미지 저장
			if (file != undefined) await this.uploadFileRepository.saveFile(file);

			// 프로필 저장
			return await this.profileRepository.updateProfile(user, createProfileDto);
		} catch (err) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
					{ err },
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async updateProfileImage(user: User, profileImage: multerS3.File): Promise<ResponseDto> {
		// 받은 이미지 파일로 엔티티 생성
		const file = new UploadFile();
		file.originalName = profileImage.originalname;
		file.mimeType = profileImage.mimetype;
		file.size = profileImage.size;
		file.url = profileImage.location;

		// user 객체 기반으로 프로필 불러옴
		let profile: Profile = await this.profileRepository.findOne({ user });

		// 프로필 없을 때 예외처리
		if (!profile) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.PROFILE_NOT_EXIST,
					true,
					ResponseMessage.PROFILE_NOT_EXIST,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 프로필 이미지 url 을 프로필 객체에 매핑
		profile.profile_image_url = file.url;

		// 디비에 저장
		try {
			await this.uploadFileRepository.save(file);
			profile = await this.profileRepository.save(profile);

			Logger.log(`User ${user.idx} upload profile image`);
			return new ResponseDto(HttpStatus.ACCEPTED, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, profile);
		} catch (error) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					'profile image uploading has error',
					error,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
