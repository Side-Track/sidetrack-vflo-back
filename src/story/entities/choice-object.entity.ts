import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Script } from './script.entity';

@Entity()
export class ChoiceObject extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	text: string;

	@Column()
	linked_scene_id: number;

	@ManyToOne((type) => Script, (script) => script.choice_list)
	script: Script;
}
