import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
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

	@Column({
		type: 'boolean',
		default: false,
	})
	email_verified: Boolean;

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
}
