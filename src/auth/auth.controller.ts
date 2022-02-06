import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body('email') email: string, @Body ('password') password: string): Promise<ResponseDto> {

    return this.authService.signUp(email, password);
  }

  @Get('/test')
  test(): Promise<ResponseDto> {
    return this.authService.getAllUsers();
  }
}
