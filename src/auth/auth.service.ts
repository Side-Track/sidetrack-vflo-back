import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDto } from 'src/dto/response.dto';
import { UserCredentialDto } from './dto/user-credential.dto';
import { EmailVerificationRepository } from './email_verification.repository';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

import constant from 'src/response.constant';
import { EmailVerificationDto } from './dto/email-verification.dto';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,
		private emailVerficiationRepository: EmailVerificationRepository,
		private readonly mailerService: MailerService,
		private jwtService: JwtService,
	) {}

	// 회원 가입
	async signUp(userCredentialDto: UserCredentialDto): Promise<ResponseDto> {
		await this.userRepository.createUser(userCredentialDto);

		return new ResponseDto(constant.HttpStatus.OK, undefined, undefined);
	}

	// 로그인
	async signIn(userCredentialDto: UserCredentialDto): Promise<ResponseDto> {
		// DTO 로 부터 데이터 받음
		const { email, password } = userCredentialDto;

		// 받은 데이터 기준으로 db 검색
		const user = await this.userRepository.findOne({ email: email });

		// 요청으로부터 온 비밀번호와 암호화 된 비밀번호 검사
		const passwordCompareResult = await bcrypt.compare(password, user.password);
		if (user != undefined && passwordCompareResult) {
			// 유저 토큰 생성
			const { idx, email, email_verified } = user;
			const payload = {
				idx: idx,
				email: email,
				email_verified: email_verified,
			};
			const accessToken = await this.jwtService.sign(payload);

			return new ResponseDto(constant.HttpStatus.OK, 'Sign-in success!', { accessToken });
		} else {
			throw new UnauthorizedException('Sign-in Failed');
		}
	}

	// 인증 메일 발송
	async sendVerificationMail(email: string): Promise<ResponseDto> {
		const user = await this.userRepository.findOne({ email: email });

		// 이미 인증된 유저라면 패스
		if (user.email_verified) {
			return new ResponseDto(constant.HttpStatus.OK, 'Already verified account.', { verified: user.email_verified });
		}

		// 코드를 생성함
		const verificationCode = await this.emailVerficiationRepository.createVerificationCode(email);

		// 이메일 내용 작성
		const sendedMail = await this.mailerService.sendMail({
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
		if (sendedMailResponse.search('OK') && sendedMailReceiver === email) {
			return new ResponseDto(constant.HttpStatus.OK, 'Email-verification code is generated', undefined);
		}
	}

	// 이메일 인증
	async verifyEmail(emailVerificationDto: EmailVerificationDto): Promise<ResponseDto> {
		// 이메일 인증하기
		const verified = await this.emailVerficiationRepository.verifyEmail(emailVerificationDto);
		const { email } = emailVerificationDto;

		// 인증 성공
		if (verified) {
			// 유저 검색하여 email_verified 를 true로
			const user = await this.userRepository.findOne({ email: email });
			if (user != undefined) {
				user.email_verified = true;
				await this.userRepository.save(user);

				return new ResponseDto(constant.HttpStatus.OK, 'Email is verfied', { verified: verified });
			}
		} else {
			// 만약 인증 실패라면
			return new ResponseDto(constant.HttpStatus.OK, "Can't find any matchs with email, code pair", {
				verified: verified,
			});
		}
	}

	// 중복 이메일 검사
	async checkDuplicateEmail(email: string): Promise<ResponseDto> {
		const user = await this.userRepository.count({ email });

		if (user == 0) {
			return new ResponseDto(constant.HttpStatus.OK, 'Sign up available', { available: true });
		}

		return new ResponseDto(constant.HttpStatus.OK, 'Duplicate User exist', { available: false });
	}

	// 비밀번호 리셋
	async resetPassword(email: string): Promise<ResponseDto> {
		let user = await this.userRepository.findOne({ email });

		// 해당 이메일 계정이 없으면
		if (user == undefined) {
			return new ResponseDto(constant.HttpStatus.DATA_NOT_FOUND, "Can't find any account with email", {});
		}

		// 계정이 있다면
		const tempPassword = await this.userRepository.createTemporaryPassword(user);

		// 이메일 내용 작성
		const sendedMail = await this.mailerService.sendMail({
			to: email, // list of receivers
			from: process.env.EMAIL_HOST, // sender address
			subject: '[VFLO] 비밀번호 초기화 ✔', // Subject line
			text: '인증코드 : ' + tempPassword + '\n임시 비밀번호로 로그인 후 새 비밀번호로 변경하십시오', // plaintext body
			// html: '<b>welcome</b>', // HTML body content
		});

		// 메일전송 응답객체의 응답문
		const sendedMailResponse = sendedMail.response;

		// 메일전송성공 대상 이메일
		const sendedMailReceiver = sendedMail.accepted[0];

		// 메일 발송 완료 되었다면
		if (sendedMailResponse.search('OK') && sendedMailReceiver === email) {
			const response = new ResponseDto(constant.HttpStatus.OK, 'Temporary Password is sented.', undefined);
			response.setCode('SUCCESS');
			response.setError(false);
			return response;
		} else {
			throw new InternalServerErrorException(`Password Reset Failed. Internal Server error. Plz contact server admin`);
		}
	}

	async getAllUsers(): Promise<ResponseDto> {
		const userList: User[] = await this.userRepository.selectAllUsers();
		return new ResponseDto(constant.HttpStatus.OK, undefined, { list: userList });
	}
}
