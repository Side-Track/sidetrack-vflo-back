import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDto } from 'src/dto/response.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private readonly mailerService: MailerService
  ) {}


  async sendVerificationMail(email: string):Promise<ResponseDto> {
    let sended = await this.mailerService
        .sendMail({
          to: email, // list of receivers
          from: process.env.EMAIL_HOST, // sender address
          subject: '[VFLO] 회원가입 이메일 인증 ✔', // Subject line
          text: '인증코드 :  ei3f2d', // plaintext body
          // html: '<b>welcome</b>', // HTML body content
        });

    let sendMailResponse = sended.response; // 메일전송 응답객체의 응답문
    let receiver = sended.accepted[0]; // 메일전송성공 대상 이메일
    if(sendMailResponse.search('OK') && receiver === email) {
      let response = new ResponseDto(200, undefined, undefined)

      return response;
    }
  }

  async signUp(email: string, password: string): Promise<ResponseDto> {
    this.userRepository.createUser(email, password);

    let response = new ResponseDto(200, undefined, undefined) 
    return response;
  }

  async getAllUsers(): Promise<ResponseDto> {
    let userList:User[] = await this.userRepository.selectAllUsers();
    let response = new ResponseDto(200, undefined, { list:userList }) 
    return response;
  }
}
