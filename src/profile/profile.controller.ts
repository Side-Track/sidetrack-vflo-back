import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(AuthGuard())
export class ProfileController {

  constructor(private profileService: ProfileService) {}

}
