import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from 'src/profile/profile.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationRepository } from './repositories/email_verification.repository';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from '../user/repositories/user.repository';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [
		forwardRef(() => ProfileModule),
		forwardRef(() => UserModule),
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
	providers: [JwtStrategy, AuthService],
	exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
