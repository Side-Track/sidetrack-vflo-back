import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Script } from './script.entity';

@Entity()
export class Line extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	text: string;

	@Column()
	is_lineked: boolean;

	@ManyToOne((type) => Script, (script) => script.line_list)
	script: Script;
}
