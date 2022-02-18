import { MailerService } from '@nestjs-modules/mailer';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { UserCredentialDto } from '../user/dto/user-credential.dto';
import { EmailVerificationRepository } from './repositories/email_verification.repository';
import { User } from '../user/entities/user.entity';
import { EmailVerificationDto } from './dto/email-verification.dto';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ResponseCode } from 'src/response.code.enum';
import { EmailVerification } from './entities/email_verification.entity';
import { ResponseMessage } from 'src/response.message.enum';
import { UserService } from 'src/user/user.service';
import { SignInCredentialDto } from './dto/sign-in-credential.dto';

@Injectable()
export class AuthService {
	// @InjectRepository() 데코레이터는 기본 TypeOrm 기본 리포사용시에만 사용
	// ex : private userRepository : Repository<User> 와 같이 엔티티 사용하여 쓸 때만 이용

	// 현재와 같이 Repository 파일이 따로 존재 시에는 아래와 같이 하는게 좋다.
	constructor(
		private emailVerficiationRepository: EmailVerificationRepository,

		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,

		private readonly mailerService: MailerService,
		private jwtService: JwtService,
	) {}

	// 중복 이메일 검사
	async checkDuplicateEmail(email: string): Promise<ResponseDto> {
		const count = await this.userService.getUserCountByEmail(email);

		if (count == 0) {
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'Sign up available', {
				available: true,
			});
		}

		// 이미 유저 존재할 때
		const response = new ResponseDto(
			HttpStatus.FOUND,
			ResponseCode.ALREADY_REGISTERED_USER,
			true,
			ResponseMessage.ALREADY_REGISTERED_USER,
			{
				available: false,
			},
		);

		throw new HttpException(response, HttpStatus.FOUND);
	}

	// 인증 메일 발송
	async sendVerificationMail(email: string): Promise<ResponseDto> {
		// 이미 인증받은 이메일인지 검사
		const verified = await this.emailVerficiationRepository.findVerifiedEmailVerificationByEmail(email);

		// 이미 인증된 이메일이라면 response error return
		if (verified != undefined) {
			const response = new ResponseDto(
				HttpStatus.OK,
				ResponseCode.ALREADY_VERIFIED_EMAIL,
				true,
				ResponseMessage.ALREADY_VERIFIED_EMAIL,
				{ verified: verified },
			);

			throw new HttpException(response, HttpStatus.OK);
		}

		// 인증 받아야 한다면 : 가입은 되었으나 인증은 안된경우와 처음 인증하고 가입절차 밟는 경우
		// 코드를 생성함
		const verificationCode = await this.emailVerficiationRepository.createVerificationCode(email);

		// 이메일 내용 작성
		let sendedMail = undefined;
		try {
			sendedMail = await this.mailerService.sendMail({
				to: email, // list of receivers
				from: process.env.EMAIL_HOST, // sender address
				subject: '[VFLO] 회원가입 이메일 인증 ✔', // Subject line
				text: '인증코드 : ' + verificationCode, // plaintext body
				// html: '<b>welcome</b>', // HTML body content
			});
		} catch (err) {
			// 이메일 보낼 때 오류
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.MAILER_ERROR,
					true,
					ResponseMessage.MAILER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 이메일 보낸 후 응답객체가 존재하지 않을 때
		if (sendedMail == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.MAILER_ERROR,
					true,
					ResponseMessage.MAILER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 메일전송 응답객체의 응답문
		const sendedMailResponse = sendedMail.response;

		// 메일전송성공 대상 이메일
		const sendedMailReceiver = sendedMail.accepted[0];

		// 메일 발송 완료 되었다면
		if (sendedMailResponse.search('OK') && sendedMailReceiver === email) {
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '인증메일이 발송되었습니다.');
		}
	}

	// 이메일 인증
	async verifyEmail(emailVerificationDto: EmailVerificationDto): Promise<ResponseDto> {
		// 이메일 인증하기
		let verifyObject: EmailVerification = await this.emailVerficiationRepository.findVerficationEmailCodePair(
			emailVerificationDto,
		);

		// 검색된 결과가 있으면(발행했던 코드라면)
		if (verifyObject != undefined) {
			// 만료 여부
			const isExpired = verifyObject.expired_date < new Date() ? true : false;

			// 만료되었을 경우
			if (isExpired) {
				return new ResponseDto(
					HttpStatus.OK,
					ResponseCode.EXPIRED_VERIFICATION_CODE,
					true,
					ResponseMessage.EXPIRED_VERIFICATION_CODE,
					{ isExpired: true },
				);
			}

			// verified_date update
			verifyObject.verified_date = new Date();
			await this.emailVerficiationRepository.save(verifyObject);
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '이메일 인증 성공');
		} else {
			// 검색 결과 없으면 (해당 이메일에 대해 발행했던 코드가 아니라면)
			throw new HttpException(
				new ResponseDto(HttpStatus.OK, ResponseCode.DATA_NOT_FOUND, true, ResponseMessage.DATA_NOT_FOUND),
				HttpStatus.OK,
			);
		}
	}

	// 회원 가입
	async signUp(userCredentialDto: UserCredentialDto): Promise<ResponseDto> {
		const { email } = userCredentialDto;

		const existUser: User = await this.userService.getUserByEmail(email);

		// 인증받은 이메일인지 판단
		const verifiedEmail: EmailVerification =
			await this.emailVerficiationRepository.findVerifiedEmailVerificationByEmail(email);

		// 이미 유저 존재함
		if (existUser != undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.CONFLICT,
					ResponseCode.ALREADY_REGISTERED_USER,
					true,
					ResponseMessage.ALREADY_REGISTERED_USER,
				),
				HttpStatus.CONFLICT,
			);
		}

		// 인증받은 이메일이 아니라면(인증받은 이메일-코드 페어가 없으면)
		if (verifiedEmail == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.UNAUTHORIZED,
					ResponseCode.NOT_VERIFIED_EMAIL,
					true,
					ResponseMessage.NOT_VERIFIED_EMAIL,
				),
				HttpStatus.UNAUTHORIZED,
			);
		}

		// 유저 만들기
		const createResponseDto: ResponseDto = await this.userService.createUser(userCredentialDto, verifiedEmail);
		const createData = createResponseDto.data;

		// 생성된 유저와, 자동생성된 프로필
		const user = createData['user'];
		const profile = createData['profile'];

		// 클라이언트에 응답할 DTO의 데이터 객체
		const responseData = {};

		// 프로필 만들기가 실패했을 경우, 명시적 생성을 하라는 플래그 내려줌
		if (profile == undefined) {
			responseData['isProfileAutoGenerated'] = false;
		} else {
			responseData['isProfileAutoGenerated'] = true;
		}

		// 성공 시
		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '회원가입이 완료되었습니다.', responseData);
	}

	// 로그인
	async signIn(signInCredentialDto: SignInCredentialDto): Promise<ResponseDto> {
		// DTO 로 부터 데이터 받음
		const { email, password } = signInCredentialDto;

		// 받은 데이터 기준으로 db 검색
		const user = await this.userService.getUserByEmail(email);

		// 존재하지 않는 유저일경우
		// 오류 메세지는 보안을 위해 이메일이나 비밀번호가 잘못되었다고 띄움
		if (!user) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.NOT_FOUND,
					ResponseCode.WRONG_EMAIL_OR_PASSWORD,
					true,
					ResponseMessage.WRONG_EMAIL_OR_PASSWORD,
				),
				HttpStatus.NOT_FOUND,
			);
		}

		// 요청으로부터 온 비밀번호와 암호화 된 비밀번호 검사
		const passwordCompareResult = await bcrypt.compare(password, user.password);

		if (passwordCompareResult) {
			// 유저 토큰 생성
			const { idx, email, email_verification, is_admin } = user;
			const payload = {
				userIdx: idx,
				email: email,
				emailVerified: email_verification != undefined ? true : false,
				isAdmin: is_admin,
			};
			const accessToken = await this.jwtService.sign(payload);

			// 정상처리. 토큰과 함께 반환
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '로그인 성공', { accessToken });
		} else {
			// 비밀번호가 다를경우
			throw new HttpException(
				new ResponseDto(
					HttpStatus.NOT_FOUND,
					ResponseCode.WRONG_EMAIL_OR_PASSWORD,
					true,
					ResponseMessage.WRONG_EMAIL_OR_PASSWORD,
				),
				HttpStatus.NOT_FOUND,
			);
		}
	}

	// 비밀번호 리셋
	// TODO : 인증절차 거쳐야 할 듯
	async resetPassword(email: string): Promise<ResponseDto> {
		let user = await this.userService.getUserByEmail(email);

		// 해당 이메일 계정이 없으면
		if (user == undefined) {
			throw new HttpException(
				new ResponseDto(HttpStatus.NO_CONTENT, ResponseCode.DATA_NOT_FOUND, true, ResponseMessage.DATA_NOT_FOUND),
				HttpStatus.NO_CONTENT,
			);
		}

		// 계정이 있다면 ============

		// 임시비밀번호 생성
		const tempPassword = await this.userService.createTemporaryPassword(user);

		// 이메일 내용 작성
		let sendedMail = undefined;
		try {
			sendedMail = await this.mailerService.sendMail({
				to: email, // list of receivers
				from: process.env.EMAIL_HOST, // sender address
				subject: '[VFLO] 비밀번호 초기화 ✔', // Subject line
				text: '인증코드 : ' + tempPassword + '\n임시 비밀번호로 로그인 후 새 비밀번호로 변경하십시오', // plaintext body
				// html: '<b>welcome</b>', // HTML body content
			});
		} catch (err) {
			// 이메일 보낼 때 오류
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.MAILER_ERROR,
					true,
					ResponseMessage.MAILER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 이메일 응답객체 존재하지 않을 때
		if (sendedMail == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.MAILER_ERROR,
					true,
					ResponseMessage.MAILER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 메일전송 응답객체의 응답문
		const sendedMailResponse = sendedMail.response;

		// 메일전송성공 대상 이메일
		const sendedMailReceiver = sendedMail.accepted[0];

		// 메일 발송 완료 되었다면
		if (sendedMailResponse.search('OK') && sendedMailReceiver === email) {
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, '임시비밀번호가 발송되었습니다.');
		} else {
			throw new HttpException(
				new ResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, ResponseCode.ETC, true, ResponseMessage.ETC),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
