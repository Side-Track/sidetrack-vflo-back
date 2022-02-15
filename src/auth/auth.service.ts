import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDto } from 'src/dto/response.dto';
import { UserCredentialDto } from './dto/user-credential.dto';
import { EmailVerificationRepository } from './repositories/email_verification.repository';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { EmailVerificationDto } from './dto/email-verification.dto';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ResponseCode } from 'src/response.code.enum';
import { EmailVerification } from './entities/email_verification.entity';
import { Connection } from 'typeorm';
import { ProfileService } from 'src/profile/profile.service';
import { ProfileDto } from 'src/profile/dto/profile.dto';
import { ProfileRepository } from 'src/profile/profile.repository';
import { Profile } from 'src/profile/entities/profile.entity';

@Injectable()
export class AuthService {
	// Cause : any method in repository occur 500 internal error.
	// Solve : @InjectionRepository() 대신 커넥션을 이용해서 다음과 같이 정의하는 방법을 사용함.
	private userRepository: UserRepository;
	private emailVerficiationRepository: EmailVerificationRepository;
	private profileRepository: ProfileRepository;
	constructor(
		private readonly connection: Connection,
		private readonly mailerService: MailerService,
		private jwtService: JwtService,
	) {
		this.userRepository = this.connection.getCustomRepository(UserRepository);
		this.emailVerficiationRepository = this.connection.getCustomRepository(EmailVerificationRepository);
		this.profileRepository = this.connection.getCustomRepository(ProfileRepository);
	}

	/* constructor(
	// 	@InjectRepository(UserRepository)
	// 	private userRepository: UserRepository,

	// 	@InjectRepository(EmailVerificationRepository)
	// 	private emailVerficiationRepository: EmailVerificationRepository,
	//  private readonly mailerService: MailerService,
	//	private jwtService: JwtService,
	// ) {}
	*/

	// 중복 이메일 검사
	async checkDuplicateEmail(email: string): Promise<ResponseDto> {
		const count = await this.userRepository.count({ email });

		if (count == 0) {
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'Sign up available', {
				available: true,
			});
		}

		const response = new ResponseDto(
			HttpStatus.FOUND,
			ResponseCode.ALREADY_REGISTERED_USER,
			true,
			'Duplicate User exist',
			{
				available: false,
			},
		);

		throw new HttpException(response, HttpStatus.FOUND);
	}

	// 인증 메일 발송
	async sendVerificationMail(email: string): Promise<ResponseDto> {
		// 이미 인증받은 유저인지 검사
		const user = await this.userRepository.findOne({ email: email });
		const verified = await this.emailVerficiationRepository.findVerifiedEmailVerificationByEmail(email);

		// 이미 인증된 유저라면 response error return
		if (user && user.email_verified && verified) {
			const response = new ResponseDto(
				HttpStatus.OK,
				ResponseCode.ALREADY_VERIFIED_ACCOUNT,
				true,
				'Already verified account.',
				{ verified: user.email_verified },
			);

			throw new HttpException(response, HttpStatus.OK);
		}

		// 인증 받아야 한다면 : 가입은 되었으나 인증은 안된경우와 처음 인증하고 가입절차 밟는 경우

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
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'Email-verification code is generated');
		}
	}

	// 이메일 인증
	async verifyEmail(emailVerificationDto: EmailVerificationDto): Promise<ResponseDto> {
		// 이메일 인증하기
		let verifyObject: EmailVerification = await this.emailVerficiationRepository.findAvailableEmailVerification(
			emailVerificationDto,
		);

		// 검색된 결과가 있으면(발행했던 코드라면)
		if (verifyObject != undefined) {
			// verified_date update
			verifyObject.verified_date = new Date();
			await this.emailVerficiationRepository.save(verifyObject);
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'email is verified!');
		} else {
			// 검색 결과 없으면
			throw new HttpException(
				new ResponseDto(
					HttpStatus.NO_CONTENT,
					ResponseCode.DATA_NOT_FOUND,
					false,
					"Can't find any matchs with email, code data",
				),
				HttpStatus.NO_CONTENT,
			);
		}
	}

	// 회원 가입
	async signUp(userCredentialDto: UserCredentialDto): Promise<ResponseDto> {
		const { email } = userCredentialDto;

		// 인증받은 이메일인지 판단
		const verifiedEmail: EmailVerification =
			await this.emailVerficiationRepository.findVerifiedEmailVerificationByEmail(email);

		// 인증받은 이메일이 아니라면(인증받은 이메일-코드 페어가 없으면)
		if (!verifiedEmail) {
			throw new HttpException(
				new ResponseDto(HttpStatus.UNAUTHORIZED, ResponseCode.NOT_VERIFIED_EMAIL, true, 'Not Verified Email.'),
				HttpStatus.UNAUTHORIZED,
			);
		}

		// 유저 만들기
		const user: User = await this.userRepository.createUser(userCredentialDto);

		// 유저 만들기가 모종의 이유로 실패 시
		if (!user) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.ETC,
					true,
					'createUser - unspecific error occured.',
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const profile = await this.profileRepository.createProfile(user, new ProfileDto());

		// 프로필 자동생성이 모종의 이유로 실패 시
		if (!profile) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.ETC,
					true,
					'createProfile - unspecific error occured.',
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// 성공 시
		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'Sign-up success!');
	}

	// 로그인
	async signIn(userCredentialDto: UserCredentialDto): Promise<ResponseDto> {
		// DTO 로 부터 데이터 받음
		const { email, password } = userCredentialDto;

		// 받은 데이터 기준으로 db 검색
		const user = await this.userRepository.findOne({ email: email });

		// 존재하지 않는 유저일경우
		if (!user) {
			throw new HttpException(
				new ResponseDto(HttpStatus.NOT_FOUND, ResponseCode.WRONG_EMAIL_OR_PASSWORD, true, 'Sign-in Failed'),
				HttpStatus.NOT_FOUND,
			);
		}

		// 요청으로부터 온 비밀번호와 암호화 된 비밀번호 검사
		const passwordCompareResult = await bcrypt.compare(password, user.password);

		if (passwordCompareResult) {
			// 유저 토큰 생성
			const { idx, email, email_verified, is_admin } = user;
			const payload = {
				userIdx: idx,
				email: email,
				emailVerified: email_verified,
				isAdmin: is_admin,
			};
			const accessToken = await this.jwtService.sign(payload);

			// 정상처리. 토큰과 함께 반환
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'Sign-in success!', { accessToken });
		} else {
			// 비밀번호가 다를경우
			throw new HttpException(
				new ResponseDto(HttpStatus.BAD_REQUEST, ResponseCode.WRONG_EMAIL_OR_PASSWORD, true, 'Sign-in Failed'),
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	// 비밀번호 리셋
	async resetPassword(email: string): Promise<ResponseDto> {
		let user = await this.userRepository.findOne({ email });

		// 해당 이메일 계정이 없으면
		if (user == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.NOT_FOUND,
					ResponseCode.NOT_REGISTERED_USER,
					true,
					"Can't find any account with email",
				),
				HttpStatus.NOT_FOUND,
			);
		}

		// 계정이 있다면 ============

		// 임시비밀번호 생성
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
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, 'Temporary Password is sented.');
		} else {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.ETC,
					true,
					`Password Reset Failed. Internal Server error. Plz contact server admin`,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
