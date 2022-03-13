import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';

@Module({
	imports: [AuthModule],
	controllers: [StoryController],
	providers: [StoryService],
})
export class StoryModule {}
