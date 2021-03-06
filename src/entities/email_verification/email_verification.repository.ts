import { HttpException, HttpStatus, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { EntityRepository, getConnection, IsNull, Not, Repository } from 'typeorm';
import { EmailVerification } from './email_verification.entity';
import { EmailVerificationDto } from '../../auth/dto/email-verification.dto';
import authPolicy from '../../auth/auth.policy';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';
import { query } from 'express';

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

		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();
		try {
			await this.save(emailVerificationTuple);

			await queryRunner.commitTransaction();
			return code;
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		} finally {
			await queryRunner.release();
		}
	}

	// 인증 가능한 이메일 - 인증코드 페어 찾기
	async findVerficationEmailCodePair(emailVerificationDto: EmailVerificationDto): Promise<EmailVerification> {
		const { email, code } = emailVerificationDto;

		// 이메일과 생성된 코드로 검색
		const query = this.createQueryBuilder('email_verification');
		query.where('email = :email', { email: email }).andWhere('verification_code = :code', { code: code });
		// .andWhere({
		// 	verified_date: IsNull(),
		// });
		// .where('expired_date >= :currentDate', { currentDate: new Date() })

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
