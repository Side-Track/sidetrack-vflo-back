import { InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { ResponseDto } from 'src/dto/response.dto';
import { EntityRepository, Repository } from 'typeorm';
import { ProfileDto } from './dto/profile.dto';
import { Profile } from './entities/profile.entity';

import Constant from 'src/response.constant';
import { ResponseCode } from 'src/response.code.enum';

@EntityRepository(Profile)
export class ProfileRepository extends Repository<Profile> {
	async createProfile(user: User, profileDto: ProfileDto): Promise<Profile> {
		let { nickname, bio } = profileDto;

		nickname = nickname == undefined ? user.email.split('@')[0] : nickname;

		let profile = this.create({ user, nickname, bio });

		try {
			profile = await this.save(profile);

			return profile;
		} catch (err) {
			throw new InternalServerErrorException('Internal Server Error is occured. Plz contact administartor.');
		}
	}

	async updateProfile(user: User, profileDto: ProfileDto): Promise<ResponseDto> {
		const { nickname, bio } = profileDto;

		let profile = await this.findOne({ user: user });

		if (!profile) {
			return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.DATA_NOT_FOUND, true, 'Profile Not Founded');
		}

		profile.nickname = nickname;
		profile.bio = bio;

		try {
			profile = await this.save(profile);

			return new ResponseDto(Constant.HttpStatus.OK, ResponseCode.SUCCESS, false, 'Profile is Updated!', { profile });
		} catch (err) {
			throw new InternalServerErrorException('Internal Server Error is occured. Plz contact administartor.');
		}
	}

	async getProfile(userIdx: number) {}
}
