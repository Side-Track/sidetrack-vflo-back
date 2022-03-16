import { User } from 'src/entities/user/user.entity';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from 'typeorm';
import { Scene } from './scene.entity';
import { StoryGenrePair } from './story-genere-pair.entity';

@Entity()
@Unique(['title'])
export class Story extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	description: string;

	@ManyToOne((type) => User, (user) => user.story_list)
	author: User;

	@Column({ default: 0 })
	playing_user_count: number;

	@Column({ default: 0 })
	tried_user_count: number;

	@Column({ default: false })
	access_deny: boolean;

	@Column({ default: false })
	is_open: boolean;

	@OneToMany((type) => Scene, (scene) => scene.story)
	scene_list: Scene[];

	@CreateDateColumn()
	created_date: Date;

	@Column()
	last_update_date: Date;

	// for relations
	@OneToMany((type) => StoryGenrePair, (storyGenrePair) => storyGenrePair.story)
	story_genre_pair_list: StoryGenrePair[];
}
