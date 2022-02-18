import { Body, Controller, Get, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseDto } from 'src/dto/response.dto';
import { ProfileDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';
import { ResponseCode } from 'src/response.code.enum';
import GlobalPipes from '../pipes/global-pipes.pipe';
import { CreateProfileDto } from './dto/create-profile.dto';
import { GetUser } from 'src/user/decorators/get-user.decorator';

@Controller('profile')
@UseGuards(AuthGuard())
export class ProfileController {
	constructor(private profileService: ProfileService) {}

	@Get('/check_nickname')
	checkNickname(@Body('nickname') nickname: string, @Body('recommend') recommend: boolean): Promise<ResponseDto> {
		return this.profileService.checkDuplicateNickname(nickname, recommend);
	}

	@Post('/create_profile')
	@UsePipes(ValidationPipe)
	createProfile(@GetUser() user, @Body() createProfileDto: CreateProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx
		const requsetUserIdx = user.idx;
		return this.profileService.explicitCreateProfile(requsetUserIdx, createProfileDto);
	}

	@Post('/update_profile')
	@UsePipes(ValidationPipe)
	updateProfile(@GetUser() user, @Body() createProfileDto: CreateProfileDto): Promise<ResponseDto> {
		// 토큰으로 부터 받은 유저 idx
		const requsetUserIdx = user.idx;
		return this.profileService.updateProfile(requsetUserIdx, createProfileDto);
	}
}
