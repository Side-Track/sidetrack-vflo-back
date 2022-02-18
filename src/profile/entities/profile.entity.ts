import { User } from 'src/user/entities/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['nickname', 'user'])
export class Profile extends BaseEntity {
	@PrimaryGeneratedColumn()
	idx: number;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;

	@Column()
	nickname: string;

	@Column({
		default: null,
	})
	bio: string;

	// 장르 추가
}
