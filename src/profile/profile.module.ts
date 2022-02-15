import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserRepository } from 'src/auth/repositories/user.repository';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

@Module({
	imports: [TypeOrmModule.forFeature([ProfileRepository]), AuthModule],
	controllers: [ProfileController],
	providers: [ProfileService, ProfileRepository],
})
export class ProfileModule {}
