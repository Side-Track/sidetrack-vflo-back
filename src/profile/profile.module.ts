import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from '../entities/profile/profile.repository';
import { ProfileService } from './profile.service';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/entities/user/user.repository';

@Module({
	imports: [TypeOrmModule.forFeature([ProfileRepository, UserRepository]), AuthModule],
	controllers: [ProfileController],
	providers: [ProfileService],
	exports: [ProfileService],
})
export class ProfileModule {}
