import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class ProfileDto {
	constructor(userIdx: number, nickname: string, bio: string, profileImageUrl?: string) {
		this.userIdx = userIdx;
		this.nickname = nickname;
		this.bio = bio;

		this.profileImageUrl = profileImageUrl == undefined ? '' : profileImageUrl;
	}

	@IsNotEmpty()
	@IsNumber()
	userIdx: number;

	@MaxLength(10)
	@IsNotEmpty()
	nickname: string;

	@MaxLength(150)
	bio: string;

	profileImageUrl: string;
}
