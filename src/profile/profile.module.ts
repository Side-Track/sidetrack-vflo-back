import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserRepository } from 'src/auth/repositories/user.repository';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './repositories/profile.repository';
import { ProfileService } from './profile.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
	imports: [TypeOrmModule.forFeature([ProfileRepository]), forwardRef(() => AuthModule)],
	controllers: [ProfileController],
	providers: [ProfileService],
	exports: [ProfileService],
})
export class ProfileModule {}
