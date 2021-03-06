import { EmailVerification } from 'src/entities/email_verification/email_verification.entity';
import { Story } from 'src/story/entities/story.entity';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	idx: number;

	@Column()
	email: string;

	@Column()
	password: string;

	@OneToOne(() => EmailVerification)
	@JoinColumn()
	email_verification: EmailVerification;

	@CreateDateColumn()
	created_date: Date;

	@UpdateDateColumn()
	updated_date: Date;

	@Column({
		type: 'datetime',
		nullable: true,
		default: null,
	})
	deleted_date: Date;

	@Column({
		type: 'boolean',
		default: false,
	})
	is_admin: boolean;

	@OneToMany((type) => Story, (story) => story.author)
	story_list: Story[];
}
