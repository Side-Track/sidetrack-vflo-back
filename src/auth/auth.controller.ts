import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body('email') email: string, @Body ('password') password: string): Promise<void> {

    console.log(email, password)
    return this.authService.signUp(email, password);
  }

  @Get('/test')
  test(): Promise<User[]> {
    return this.authService.getAllUsers();
  }
}
