import { Body, Controller, Get, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseDto } from 'src/dto/response.dto';
import { AuthService } from './auth.service';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { UserCredentialDto } from './dto/user-credential.dto';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  // 회원 가입
  @Post('/signup')
  @UsePipes(ValidationPipe)
  signUp(@Body() userCredentialDto: UserCredentialDto): Promise<ResponseDto> {

    return this.authService.signUp(userCredentialDto);
  }

  // 로그인
  @Get('/signin')
  @UsePipes(ValidationPipe)
  signIn(@Body() userCredentialDto: UserCredentialDto): Promise<ResponseDto> {
    return this.authService.signIn(userCredentialDto);
  }

  // 이메일 인증메일 보내기
  @Get('/sendverifmail')
  sendverfmail(@Body('email') email: string): Promise<ResponseDto> {
    return this.authService.sendVerificationMail(email);
  }

  // 이메일 인증
  @Get('/verifyemail')
  @UsePipes(ValidationPipe)
  verifyemail(@Body() emailVerificationDto: EmailVerificationDto): Promise<ResponseDto> {
    return this.authService.verifyEmail(emailVerificationDto);
  }

  @Get("/checkemail")
  checkEmail(@Body('email') email: string): Promise<ResponseDto> {
    return this.authService.checkDuplicateEmail(email);
  }

  @Get('/test')
  @UseGuards(AuthGuard())
  test(@Req() req) {
    console.log(req)
    return this.authService.getAllUsers();
  }
}

