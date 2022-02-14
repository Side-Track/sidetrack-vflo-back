import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseDto } from 'src/dto/response.dto';
import { ProfileDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';
import Constant from 'src/response.constant';
import { ResponseCode } from 'src/response.code.enum';

@Controller('profile')
@UseGuards(AuthGuard())
export class ProfileController {
	constructor(private profileService: ProfileService) {}

	@Get('/check_nickname')
	checkNickname(@Body('nickname') nickname: string, @Body('recommend') recommend: boolean): Promise<ResponseDto> {
		return this.profileService.checkDuplicateNickname(nickname, recommend);
	}

	@Post('/create_profile')
	createProfile(@Req() req, @Body() profileDto: ProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx
		const requsetUserIdx = req.user.idx;
		return this.profileService.createProfile(requsetUserIdx, profileDto);
	}

	@Post('/update_profile')
	updateProfile(@Req() req, @Body() profileDto: ProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx
		const requsetUserIdx = req.user.idx;
		return this.profileService.updateProfile(requsetUserIdx, profileDto);
	}
}
