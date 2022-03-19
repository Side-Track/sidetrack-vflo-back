import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChoiceObject } from './choice-object.entity';
import { Line } from './line.entity';
import { Scene } from './scene.entity';

@Entity()
export class Script extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne((type) => Scene, (scene) => scene.script_list)
	scene: Scene;

	@Column()
	is_choice: boolean;

	@OneToMany((type) => Line, (line) => line.script)
	line_list: Line[];

	@OneToMany((type) => ChoiceObject, (choiceObject) => choiceObject.script)
	choice_list: ChoiceObject[];
}
