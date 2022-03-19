import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonsModule } from 'src/commons/commons.module';
import { Genre } from 'src/entities/common_genre/genre.entity';
import { ChoiceObject } from './entities/choice-object.entity';
import { Line } from './entities/line.entity';
import { Scene } from './entities/scene.entity';
import { Script } from './entities/script.entity';
import { StoryGenrePair } from './entities/story-genere-pair.entity';
import { Story } from './entities/story.entity';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';

@Module({
	imports: [
		AuthModule,
		CommonsModule,
		TypeOrmModule.forFeature([Story, StoryGenrePair, Scene, Line, ChoiceObject, Script]),
	],
	controllers: [StoryController],
	providers: [StoryService],
})
export class StoryModule {}
