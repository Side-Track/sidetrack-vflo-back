import { Body, Controller, Get, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseDto } from 'src/dto/response.dto';
import { AuthService } from './auth.service';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { UserCredentialDto } from '../user/dto/user-credential.dto';
import { User } from '../user/entities/user.entity';
import { SignInCredentialDto } from './dto/sign-in-credential.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	// 이메일 중복검사
	@Get('/check_email')
	checkEmail(@Body('email') email: string): Promise<ResponseDto> {
		return this.authService.checkDuplicateEmail(email);
	}

	// 이메일 인증메일 보내기
	@Get('/send_verification_mail')
	sendverfmail(@Body('email') email: string): Promise<ResponseDto> {
		return this.authService.sendVerificationMail(email);
	}

	// 이메일 인증
	@Get('/verify_email')
	@UsePipes(ValidationPipe)
	verifyemail(@Body() emailVerificationDto: EmailVerificationDto): Promise<ResponseDto> {
		return this.authService.verifyEmail(emailVerificationDto);
	}

	// 회원 가입
	@Post('/sign_up')
	@UsePipes(ValidationPipe)
	signUp(@Body() userCredentialDto: UserCredentialDto): Promise<ResponseDto> {
		return this.authService.signUp(userCredentialDto);
	}

	// 로그인
	@Get('/sign_in')
	@UsePipes(ValidationPipe)
	signIn(@Body() signInCredentialDto: SignInCredentialDto): Promise<ResponseDto> {
		return this.authService.signIn(signInCredentialDto);
	}

	// 비밀번호 리셋
	@Get('/reset_password')
	resetPassword(@Body('email') email: string): Promise<ResponseDto> {
		return this.authService.resetPassword(email);
	}
}
