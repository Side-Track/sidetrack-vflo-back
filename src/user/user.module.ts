import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './user.service';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository]), forwardRef(() => AuthModule), forwardRef(() => ProfileModule)],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
