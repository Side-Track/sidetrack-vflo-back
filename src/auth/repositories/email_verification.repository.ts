import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { EntityRepository, IsNull, Not, Repository } from 'typeorm';
import { EmailVerification } from '../entities/email_verification.entity';
import { EmailVerificationDto } from '../dto/email-verification.dto';
import authPolicy from '../auth.policy';

@EntityRepository(EmailVerification)
export class EmailVerificationRepository extends Repository<EmailVerification> {
	// verification code generate & create db row
	async createVerificationCode(email: string): Promise<string> {
		// 코드 생성
		let code = '';

		// 코드 최소 길이는 6자
		while (code.length < authPolicy.EmailVerificationCodeLength) {
			code = Math.random().toString(36).slice(2);
		}

		// 유효 기간 설정 후 DB 에 insert
		let expiredDate = new Date();
		expiredDate.setMinutes(expiredDate.getMinutes() + authPolicy.EmailVerificationExpiredTime);
		const emailVerificationTuple = this.create({ email: email, verification_code: code, expired_date: expiredDate });

		try {
			await this.save(emailVerificationTuple);
			return code;
		} catch (err) {
			Logger.warn(err);
			throw new InternalServerErrorException('Internal Server Error is occured. Plz contact administartor.');
		}
	}

	// 인증 가능한 이메일 - 인증코드 페어 찾기
	async findAvailableEmailVerification(emailVerificationDto: EmailVerificationDto): Promise<EmailVerification> {
		const { email, code } = emailVerificationDto;

		// 이메일과 생성된 코드로 검색
		const query = this.createQueryBuilder('email_verification');
		query
			.where('expired_date >= :currentDate', { currentDate: new Date() })
			.andWhere('email = :email', { email: email })
			.andWhere('verification_code = :code', { code: code })
			.andWhere({
				verified_date: IsNull(),
			});

		// 검색 결과
		return await query.getOne();
	}

	// 인증 된 이메일인지 판단
	async findVerifiedEmailVerificationByEmail(email: string): Promise<EmailVerification> {
		// 이메일과 생성된 코드로 검색
		const query = this.createQueryBuilder('email_verification');
		query.where('email = :email', { email: email }).andWhere({
			verified_date: Not(IsNull()),
		});

		return await query.getOne();
	}
}
