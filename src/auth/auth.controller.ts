import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  // 추후 라우터 이름 변경 가능
  @Get('/sendverifmail')
  sendverfmail(@Body('email') email: string): Promise<ResponseDto> {
    return this.authService.sendVerificationMail(email);
  }

  @Post('/signup')
  signUp(@Body('email') email: string, @Body ('password') password: string): Promise<ResponseDto> {

    return this.authService.signUp(email, password);
  }

  @Get('/test')
  test(): Promise<ResponseDto> {
    return this.authService.getAllUsers();
  }
}
