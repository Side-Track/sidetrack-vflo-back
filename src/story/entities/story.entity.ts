import { User } from 'src/entities/user/user.entity';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Scene } from './scene.entity';

@Entity()
export class Story extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	description: string;

	@OneToOne(() => User)
	@JoinColumn()
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
	created_date: number;

	@Column()
	last_update_date: number;
}
