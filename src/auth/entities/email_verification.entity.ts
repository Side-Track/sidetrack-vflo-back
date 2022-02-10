import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailVerification extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	email: string;

	@Column()
	verification_code: string;

	@CreateDateColumn()
	created_date: Date;

	@Column({
		type: 'datetime',
		nullable: false,
		default : null
	})
	expired_date: Date;

	@Column({
		type: 'datetime',
		nullable: true,
		default: null,
	})
	verified_date: Date;
}
