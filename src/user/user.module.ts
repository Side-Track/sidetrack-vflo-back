import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { UserRepository } from '../entities/user/user.repository';
import { UserService } from './user.service';
import { ProfileModule } from 'src/profile/profile.module';
import { ProfileRepository } from 'src/entities/profile/profile.repository';

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository])],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
