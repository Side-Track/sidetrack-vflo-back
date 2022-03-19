import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Script } from './script.entity';
import { Story } from './story.entity';

@Entity()
export class Scene extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne((type) => Story, (story) => story.scene_list)
	story: Story;

	@OneToMany((type) => Script, (script) => script.scene)
	script_list: Script[];
}
