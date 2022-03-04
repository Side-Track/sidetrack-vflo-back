import { User } from 'src/entities/user/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UploadFile } from '../common_upload-file/upload_file.entity';

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

	@Column()
	profile_image_url: string;

	// 장르 추가
}
