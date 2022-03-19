import { StoryGenrePair } from 'src/story/entities/story-genere-pair.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Genre extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	// for relations
	@OneToMany((type) => StoryGenrePair, (storyGenrePair) => storyGenrePair.genre)
	story_genre_pair_list: StoryGenrePair[];
}
