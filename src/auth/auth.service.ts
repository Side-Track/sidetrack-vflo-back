import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDto } from 'src/dto/response.dto';
import { UserCredentialDto } from './dto/user-credential.dto';
import { EmailVerificationRepository } from './email_verification.repository';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

import constant from 'src/constant';
import { EmailVerificationDto } from './dto/email-verification.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private emailVerficiationRepository: EmailVerificationRepository,
    private readonly mailerService: MailerService
  ) {}

  // 회원 가입
  async signUp(userCredentialDto: UserCredentialDto): Promise<ResponseDto> {

    await this.userRepository.createUser(userCredentialDto);

    return new ResponseDto(constant.HttpStatus.OK, undefined, undefined);
  }

  // 인증 메일 발송
  async sendVerificationMail(email: string):Promise<ResponseDto> {

    const user = await this.userRepository.findOne({email: email});

    // 이미 인증된 유저라면 패스
    if(!user.email_verified) {
      return new ResponseDto(constant.HttpStatus.OK, 'Already verified account.', {verified: user.email_verified});
    }

    // 코드를 생성함
    const verificationCode = await this.emailVerficiationRepository.createVerificationCode(email);

    // 이메일 내용 작성
    const sendedMail = await this.mailerService
        .sendMail({
          to: email, // list of receivers
          from: process.env.EMAIL_HOST, // sender address
          subject: '[VFLO] 회원가입 이메일 인증 ✔', // Subject line
          text: '인증코드 : ' + verificationCode, // plaintext body
          // html: '<b>welcome</b>', // HTML body content
        });
    
    // 메일전송 응답객체의 응답문
    const sendedMailResponse = sendedMail.response;

    // 메일전송성공 대상 이메일 
    const sendedMailReceiver = sendedMail.accepted[0]; 

    // 메일 발송 완료 되었다면
    if(sendedMailResponse.search('OK') && sendedMailReceiver === email) {
      return new ResponseDto(constant.HttpStatus.OK, 'Email-verification code is generated', undefined);
    }
  }

  // 이메일 인증
  async verifyEmail(emailVerificationDto: EmailVerificationDto): Promise<ResponseDto> {

    // 이메일 인증하기
    const verified = await this.emailVerficiationRepository.verifyEmail(emailVerificationDto);
    const {email} = emailVerificationDto;

    // 인증 성공
    if(verified) {
      // 유저 검색하여 email_verified 를 true로
      const user = await this.userRepository.findOne({email: email});
      if(user != undefined) {
        user.email_verified = true;
        await this.userRepository.save(user);

        return new ResponseDto(constant.HttpStatus.OK, 'Email is verfied', {verified: verified});
      }
    } else {
      // 만약 인증 실패라면
      return new ResponseDto(constant.HttpStatus.OK, "Can't find any matchs with email, code pair", {verified: verified});
    }
  }

  

  async getAllUsers(): Promise<ResponseDto> {
    const userList:User[] = await this.userRepository.selectAllUsers();
    return new ResponseDto(constant.HttpStatus.OK, undefined, { list:userList }) 
  
  }
}
