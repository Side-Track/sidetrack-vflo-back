import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from 'src/profile/profile.module';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ProfileService } from 'src/profile/profile.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationRepository } from './email_verification.repository';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './user.repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserRepository, EmailVerificationRepository]),
		JwtModule.registerAsync({
			// .env 에 등록되어 있는 것을 가져오는것이 비동기 작업이므로, 초기화 시에 env 요소를 못불러온 상태일 수 있음.
			// 따라서 registerAsync, ConfigService 를 사용해 동기적으로 작업함
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('JWT_SECRET'),
				signOptions: {
					expiresIn: config.get<string>('JWT_EXPIRES_IN'),
				},
			}),
		}),
		PassportModule.register({ defaultStrategy: 'jwt' }),
	],
	controllers: [AuthController],
	providers: [JwtStrategy, UserRepository, AuthService],
	exports: [JwtStrategy, UserRepository, PassportModule],
})
export class AuthModule {}
