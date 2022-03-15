import { Genre } from 'src/entities/common_genre/genre.entity';
import { BaseEntity, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Story } from './story.entity';

@Entity()
export class StoryGenrePair extends BaseEntity {
	@OneToOne(() => Story, { primary: true })
	@JoinColumn({ name: 'story_id' })
	story_id: Story;

	@OneToOne(() => Genre, { primary: true })
	@JoinColumn({ name: 'genre_id' })
	genre_id: Genre;
}
