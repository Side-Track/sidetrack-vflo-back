import { Genre } from 'src/entities/common_genre/genre.entity';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Story } from './story.entity';

@Entity()
export class StoryGenrePair extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	// @PrimaryColumn()
	@ManyToOne((type) => Story, (story) => story.story_genre_pair_list)
	story: Story;
	// @PrimaryColumn()
	@ManyToOne((type) => Genre, (genre) => genre.story_genre_pair_list)
	genre: Genre;
}
