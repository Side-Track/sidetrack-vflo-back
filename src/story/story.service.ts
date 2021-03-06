import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';
import { Story } from './entities/story.entity';
import { User } from 'src/entities/user/user.entity';
import { CreateStoryDto } from './dto/create-story.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection, In } from 'typeorm';
import { StoryGenrePair } from './entities/story-genere-pair.entity';
import { Scene } from './entities/scene.entity';
import { Script } from './entities/script.entity';
import { Line } from './entities/line.entity';
import { ChoiceObject } from './entities/choice-object.entity';
import { CommonsService } from 'src/commons/commons.service';
import { Genre } from 'src/entities/common_genre/genre.entity';
import { UpdateStoryGenrePairDto } from './dto/update-story-genre-pair-list.dto';
import { CreateScriptDto } from './dto/create-script.dto';
import { CreateChoiceObjectDto } from './dto/create-choice-object.dto';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';

@Injectable()
export class StoryService {
	constructor(
		@InjectRepository(Story)
		private storyRepository: Repository<Story>,

		@InjectRepository(StoryGenrePair)
		private storyGenrePairRepository: Repository<StoryGenrePair>,

		@InjectRepository(Scene)
		private sceneRepository: Repository<Scene>,

		@InjectRepository(Script)
		private scriptRepository: Repository<Script>,

		@InjectRepository(Line)
		private lineRepository: Repository<Line>,

		@InjectRepository(ChoiceObject)
		private choiceObjectRepository: Repository<ChoiceObject>,

		private readonly commonsService: CommonsService,
	) {}

	getStory(id: number) {
		const story = {
			title: 'Story1',
			playedUserCount: 10,
			playingUserCount: 7,
			like: 23,
			discription: 'This is sample game',

			sceneMap: {
				34: {
					id: 34,
					backgroundImage:
						'https://images.pexels.com/photos/1428277/pexels-photo-1428277.jpeg?cs=srgb&dl=pexels-eberhard-grossgasteiger-1428277.jpg&fm=jpg',

					scriptMap: {
						22: {
							id: 22,
							lineList: [
								{
									id: 120,
									text: '??? ????????? ?????? ????????? ??????. ??????????????? ????????????..',
								},
								{
									id: 122,
									text: '??????????????? ????????? ??????, ?????? ???????????? ????????? ?????? ?????????.',
								},
							],
							isLinked: 25,
						},
						25: {
							id: 25,
							lineList: [
								{
									id: 140,
									text: '????????? ????????? ???????????? ???????????? ????????????.',
									assets: [],
									Effect: [],
								},
								{
									id: 144,
									text: '(???, ?????? ?????????..?)',
								},
							],
							isLinked: 42,
						},
						42: {
							id: 42,
							lineList: [
								{
									id: 147,
									text: '?????? ????????? ????????? ????????????. ?????? ?????? ????????? ?????????.',
								},
							],
							choiceList: [
								{
									text: '??? ?????? ????????? ?????????',
									linkedSceneId: 37,
								},
								{
									text: '????????? ????????? ??? ????????? ???',
									linkedSceneId: 40,
								},
							],
							isChoice: true,
						},
					},
				},
				37: {
					id: 37,
					backgroundImage:
						'https://images.pexels.com/photos/1903702/pexels-photo-1903702.jpeg?cs=srgb&dl=pexels-roberto-shumski-1903702.jpg&fm=jpg',

					scriptMap: {
						57: {
							id: 57,
							lineList: [
								{
									id: 151,
									text: '??????.. ?????????? ???! ?????? ????????????..',
								},
								{
									id: 154,
									text: '??? ?????? ????????? ??????????',
								},
							],
							isLinked: 69,
						},
						69: {
							id: 69,
							lineList: [
								{
									id: 157,
									text: '????????? ????????? ????????????, ?????? ???????????? ????????? ????????? ??? ?????????.',
								},
								{
									id: 158,
									text: '????????? ?????????????????? ????????? ????????? ????????? ?????????.',
								},
								{
									id: 159,
									text: '??????.. ???????????????????',
								},
							],
							isLinked: 72,
						},
						72: {
							id: 72,
							lineList: [
								{
									id: 171,
									text: '???????????? ????????????.',
								},
							],
							choiceList: [
								{
									text: '??? ???????????????! ???????????? ???????????? ??????.',
									linkedSceneId: 41,
								},
								{
									text: '????????? ??????????',
									linkedSceneId: 40,
								},
							],
							isChoice: true,
						},
					},
				},
				40: {
					id: 40,
					scriptMap: {
						50: {
							id: 50,
							lineList: [
								{
									id: 174,
									text: '????????? ????????? ?????? ??????????????????.',
								},
							],
						},
					},
				},
				41: {
					id: 41,
					scriptMap: {
						52: {
							id: 52,
							lineList: [
								{
									id: 181,
									text: '????????? ???????????? ?????? ????????????, ????????? ????????? ????????? ??? ????????? ???????????????.',
								},
							],
						},
					},
				},
			},
		};

		return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, story);
	}

	async createStory(user: User, createStoryDto: CreateStoryDto): Promise<ResponseDto> {
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try {
			// Dto ??? ?????? ????????? ?????? ?????????
			const { title, description } = createStoryDto;
			const genreList = createStoryDto.genre_list;

			// Story entity ??????
			const story = this.storyRepository.create({ title, description, author: user, last_update_date: new Date() });
			// Story ??????
			const createdStory: Story = await this.storyRepository.save(story);

			// ????????? ?????? ??? ????????? ?????? ????????? ??????
			if (genreList != undefined || genreList.length > 0) {
				// ?????? ????????? ????????????
				const selectedGenreList: Genre[] = await this.commonsService.getGenreListByIdList(genreList);

				// ?????????-?????? ????????? ?????? ??????
				const storyGenreList: StoryGenrePair[] = [];
				for (let i in selectedGenreList) {
					storyGenreList.push(
						this.storyGenrePairRepository.create({
							story: createdStory,
							genre: selectedGenreList[i],
						}),
					);
				}

				// ?????????-?????? ????????? ??????
				const createdStoryGenrePairList = await this.storyGenrePairRepository.save(storyGenreList);
			}
			await queryRunner.commitTransaction();
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, createdStory);
		} catch (err) {
			await queryRunner.rollbackTransaction();

			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
					err,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		} finally {
			await queryRunner.release();
		}
	}

	async updateStoryGenre(user: User, updateStoryGenrePairDto: UpdateStoryGenrePairDto): Promise<ResponseDto> {
		const genreList = updateStoryGenrePairDto.genre_list;
		const storyId = updateStoryGenrePairDto.story_id;

		// ManyToOne ????????? ????????? ??????, Many????????? One ??? ????????? ???????????? ?????? ??? relations ????????? ManyToOne ???????????? ?????????.
		const story: Story = await this.storyRepository.findOne({ relations: ['author'], where: { id: storyId } });

		if (!story) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseMessage.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		if (story.author.idx != user.idx) {
			throw new HttpException(
				new ResponseDto(HttpStatus.UNAUTHORIZED, ResponseCode.NOT_STORY_AUTHOR, true, ResponseMessage.NOT_STORY_AUTHOR),
				HttpStatus.UNAUTHORIZED,
			);
		}

		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try {
			// ?????? ?????? ?????? ??????
			await this.storyGenrePairRepository.delete({ story });

			// ?????? ?????? ?????????
			const selectedGenreList: Genre[] = await this.commonsService.getGenreListByIdList(genreList);

			// ?????????-?????? ????????? ?????? ??????
			const storyGenreList: StoryGenrePair[] = [];
			for (let i in selectedGenreList) {
				storyGenreList.push(
					this.storyGenrePairRepository.create({
						story: story,
						genre: selectedGenreList[i],
					}),
				);
			}

			// ?????????-?????? ????????? ??????
			const createdStoryGenrePairList = await this.storyGenrePairRepository.save(storyGenreList);

			// ????????? ????????? ?????????
			story.last_update_date = new Date();
			await this.storyRepository.save(story);

			await queryRunner.commitTransaction();
			return new ResponseDto(HttpStatus.ACCEPTED, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, {
				createdStoryGenrePairList,
			});
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
					err,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		} finally {
			await queryRunner.release();
		}
	}

	async createScene(user: User, storyId: number): Promise<ResponseDto> {
		// storyId ??? ?????? ????????? ?????????
		const story: Story = await this.storyRepository.findOne({ relations: ['author'], where: { id: storyId } });

		// ????????? ???????????? ????????? throw
		if (!story) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseCode.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const scene = this.sceneRepository.create({ story });
			const createdScene: Scene = await this.sceneRepository.save(scene);

			await queryRunner.commitTransaction();
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, ResponseCode.SUCCESS, createdScene);
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseCode.INTERNAL_SERVER_ERROR,
					err,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async deleteScene(user: User, storyId: number, sceneId: number): Promise<ResponseDto> {
		const scene: Scene = await this.sceneRepository.findOne({ relations: ['story'], where: { id: sceneId } });
		const story = scene.story;

		// scene ??? ???????????? ?????? ???
		if (!scene) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCENE,
					true,
					ResponseCode.NOT_REGISTERED_SCENE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// ???????????? ???????????? ?????? ???
		if (!story) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseCode.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// ???????????? ????????? ?????? ???
		if (story.author.idx != user.idx) {
			throw new HttpException(
				new ResponseDto(HttpStatus.UNAUTHORIZED, ResponseCode.NOT_STORY_AUTHOR, true, ResponseCode.NOT_STORY_AUTHOR),
				HttpStatus.UNAUTHORIZED,
			);
		}

		const queryRunner = getConnection().createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Delete Scene
			const result = await this.sceneRepository.delete({ id: sceneId });

			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, result);
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseCode.INTERNAL_SERVER_ERROR,
					err,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async createScript(user: User, createScriptDto: CreateScriptDto): Promise<ResponseDto> {
		const sceneId = createScriptDto.sceneId;
		const scene: Scene = await this.sceneRepository.findOne({
			relations: ['story', 'story.author'],
			where: { id: sceneId },
		});

		const story = scene.story;

		// scene ??? ???????????? ?????? ???
		if (!scene) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCENE,
					true,
					ResponseCode.NOT_REGISTERED_SCENE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// ???????????? ???????????? ?????? ???
		if (!story) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseCode.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// ???????????? ????????? ?????? ???
		if (story.author.idx != user.idx) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_STORY_AUTHOR,
					true,
					ResponseCode.NOT_STORY_AUTHOR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const queryRunner = getConnection().createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const { isChoice, choiceObjectList } = createScriptDto;

			// script ????????? ?????? ??? ??????
			const script = this.scriptRepository.create({ scene: scene, is_choice: isChoice });
			const createdScript = await this.scriptRepository.save(script);

			// ????????? script ??? ?????? ????????? ???????????? ?????? ????????? ?????? ??? ?????? ???????????? ??????
			if (createdScript) {
				delete createdScript.scene;
			}

			// ?????? ??????????????? ????????? ??????????????? ??????

			// ????????? ????????? ?????? ??????
			const tempChoiceObjectList: ChoiceObject[] = [];
			let createdChoiceObjectList: ChoiceObject[] = [];
			if (isChoice) {
				// ????????? ????????? ?????? ??? ??????
				for (let i in choiceObjectList) {
					const choiceObject = choiceObjectList[i];

					tempChoiceObjectList.push(
						this.choiceObjectRepository.create({
							text: choiceObject.text,
							linked_scene_id: choiceObject.linkedSceneId,
							script: createdScript,
						}),
					);
				}

				createdChoiceObjectList = await this.choiceObjectRepository.save(tempChoiceObjectList);

				// createdChoiceObjectList ?????? ?????? ????????? ?????? ????????? ???????????? ???????????? ????????? ????????? ?????? ???????????? ??????
				if (createdChoiceObjectList.length > 0) {
					for (let i in createdChoiceObjectList) {
						let createChoiceObject = createdChoiceObjectList[i];
						delete createChoiceObject.script;
					}
				}
			}

			// response
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, {
				script: createdScript,
				choiceObjectList: createdChoiceObjectList,
			});
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseCode.INTERNAL_SERVER_ERROR,
					err,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async deleteScript(user: User, storyId: number, sceneId: number, scriptId: number): Promise<ResponseDto> {
		// ????????? ?????? ??????
		const script: Script = await this.scriptRepository.findOne({
			relations: ['scene', 'scene.story', 'scene.story.author'],
			where: { id: scriptId },
		});

		if (!script) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCRIPT,
					true,
					ResponseMessage.NOT_REGISTERED_SCRIPT,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const scene: Scene = script.scene;
		if (scene == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCENE,
					true,
					ResponseCode.NOT_REGISTERED_SCENE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const story: Story = scene.story;
		if (!story) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseCode.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const author = story.author;
		if (author.idx != user.idx) {
			throw new HttpException(
				new ResponseDto(HttpStatus.UNAUTHORIZED, ResponseCode.NOT_STORY_AUTHOR, true, ResponseCode.NOT_STORY_AUTHOR),
				HttpStatus.UNAUTHORIZED,
			);
		}

		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try {
			const deleteInfo = await this.scriptRepository.delete({ id: scriptId });

			await queryRunner.commitTransaction();
			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, deleteInfo);
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseCode.INTERNAL_SERVER_ERROR,
					err,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async createChoiceObject(user: User, createChoiceObjectDto: CreateChoiceObjectDto): Promise<ResponseDto> {
		const { scriptId, sceneId, storyId, choiceObjectList } = createChoiceObjectDto;

		const script: Script = await this.scriptRepository.findOne({
			relations: ['scene', 'scene.story', 'scene.story.author'],
			where: { id: scriptId },
		});

		// script not defined
		if (!script) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCRIPT,
					true,
					ResponseMessage.NOT_REGISTERED_SCRIPT,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// scene not defined
		const scene: Scene = script.scene;
		if (scene == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCENE,
					true,
					ResponseCode.NOT_REGISTERED_SCENE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		// story not defined
		const story: Story = scene.story;
		if (!story) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseCode.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// author unauthorize
		const author: User = story.author;
		if (author.idx != user.idx) {
			throw new HttpException(
				new ResponseDto(HttpStatus.UNAUTHORIZED, ResponseCode.NOT_STORY_AUTHOR, true, ResponseCode.NOT_STORY_AUTHOR),
				HttpStatus.UNAUTHORIZED,
			);
		}

		// ????????? ?????? ?????? ??????????????? ?????? ???
		if (!script.is_choice) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_CHOICEABLE_SCRIPT,
					true,
					ResponseMessage.NOT_CHOICEABLE_SCRIPT,
					{ script_id: scriptId, is_choice: script.is_choice },
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// ???????????? ?????? scene number??? ?????? ????????? ??? ??? ====
		const linkedSceneIdList: number[] = [];
		choiceObjectList.forEach((element) => {
			linkedSceneIdList.push(element.linkedSceneId);
		});

		let linkedSceneList: Scene[] = await this.sceneRepository.find({ where: { id: In(linkedSceneIdList) } });

		if (linkedSceneList.length <= 0) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCENE,
					true,
					ResponseMessage.NOT_REGISTERED_SCENE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const foundSceneIdList: number[] = [];
		linkedSceneList.forEach((element) => {
			foundSceneIdList.push(element.id);
		});

		linkedSceneIdList.sort();
		foundSceneIdList.sort();

		let difference = linkedSceneIdList.filter((x) => !foundSceneIdList.includes(x));

		if (difference.length > 0) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCENE,
					true,
					ResponseMessage.NOT_REGISTERED_SCENE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// choice object Entity ?????? ??? save
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try {
			const tempChoiceObjectList: ChoiceObject[] = [];
			for (let i in choiceObjectList) {
				const choiceObject = choiceObjectList[i];
				tempChoiceObjectList.push(
					this.choiceObjectRepository.create({
						text: choiceObject.text,
						linked_scene_id: choiceObject.linkedSceneId,
						script: script,
					}),
				);
			}

			const createdChoiceObjectList = await this.choiceObjectRepository.save(tempChoiceObjectList);
			await queryRunner.commitTransaction();

			// auto join column delete
			for (let i in createdChoiceObjectList) {
				delete createdChoiceObjectList[i].script;
			}

			return new ResponseDto(
				HttpStatus.OK,
				ResponseCode.SUCCESS,
				false,
				ResponseMessage.SUCCESS,
				createdChoiceObjectList,
			);
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
					err,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async createLine(user: User, createLineDto: CreateLineDto): Promise<ResponseDto> {
		const { storyId, sceneId, scriptId, text, isLinked } = createLineDto;

		// Authorization
		if (user == undefined) {
		}

		const script = await this.scriptRepository.findOne({
			relations: ['scene', 'scene.story', 'scene.story.author'],
			where: { id: scriptId },
		});

		if (script == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCRIPT,
					true,
					ResponseCode.NOT_REGISTERED_SCRIPT,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const scene = script.scene;
		if (scene == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_SCENE,
					true,
					ResponseCode.NOT_REGISTERED_SCENE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		if (scene.id != sceneId) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.OBJECT_IDENTIFIER_NOT_MATCHED,
					true,
					ResponseCode.OBJECT_IDENTIFIER_NOT_MATCHED,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const story = scene.story;
		if (story == undefined) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseCode.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		if (story.id != storyId) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.OBJECT_IDENTIFIER_NOT_MATCHED,
					true,
					ResponseCode.OBJECT_IDENTIFIER_NOT_MATCHED,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const author = story.author;
		if (author.idx != user.idx) {
			throw new HttpException(
				new ResponseDto(HttpStatus.UNAUTHORIZED, ResponseCode.NOT_STORY_AUTHOR, true, ResponseCode.NOT_STORY_AUTHOR),
				HttpStatus.UNAUTHORIZED,
			);
		}

		// create entity
		const line = this.lineRepository.create({ script: script, text: text, is_lineked: isLinked });

		// transaction
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();
		//try
		try {
			let createdLine: Line = await this.lineRepository.save(line);
			await queryRunner.commitTransaction();

			// delete all about joined datas
			delete createdLine.script;
			return new ResponseDto(HttpStatus.CREATED, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, createdLine);
		} catch (err) {
			// catch
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async deleteLine(user: User, lineId: number): Promise<ResponseDto> {
		// authorization
		if (!user) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.UNAUTHORIZED,
					ResponseCode.UNAUTHORIZED_USER,
					true,
					ResponseMessage.UNAUTHORIZED_USER,
				),
				HttpStatus.UNAUTHORIZED,
			);
		}

		const line: Line = await this.lineRepository.findOne({
			where: { id: lineId },
			relations: ['script', 'script.scene', 'script.scene.story', 'script.scene.story.author'],
		});

		if (!line) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_LINE,
					true,
					ResponseMessage.NOT_REGISTERED_LINE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const story: Story = line.script.scene.story;
		const author: User = story.author;

		if (!story) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseMessage.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		if (author.idx !== user.idx) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_STORY_AUTHOR,
					true,
					ResponseMessage.NOT_STORY_AUTHOR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// delete transaction start
		const queryRunner = await getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try {
			const deleteResult = await this.lineRepository.delete({ id: lineId });

			await queryRunner.commitTransaction();
			return new ResponseDto(HttpStatus.ACCEPTED, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, deleteResult);
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async updateLine(user: User, updateLineDto: UpdateLineDto): Promise<ResponseDto> {
		// data parse from dto
		const { id, text, isLinked } = updateLineDto;

		// authoriztion
		if (!user) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.UNAUTHORIZED,
					ResponseCode.UNAUTHORIZED_USER,
					true,
					ResponseMessage.UNAUTHORIZED_USER,
				),
				HttpStatus.UNAUTHORIZED,
			);
		}

		let line: Line = await this.lineRepository.findOne({
			where: { id },
			relations: ['script', 'script.scene', 'script.scene.story', 'script.scene.story.author'],
		});

		if (!line) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_LINE,
					true,
					ResponseMessage.NOT_REGISTERED_LINE,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const story: Story = line.script.scene.story;
		const author: User = story.author;

		if (!story) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_REGISTERED_STORY,
					true,
					ResponseMessage.NOT_REGISTERED_STORY,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		if (author.idx !== user.idx) {
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.NOT_STORY_AUTHOR,
					true,
					ResponseMessage.NOT_STORY_AUTHOR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		// delete transaction start
		const queryRunner = await getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try {
			delete line.script;

			if (text != undefined) {
				line.text = text;
			}

			if (isLinked != undefined) {
				line.is_lineked = isLinked;
			}

			const updatedLine = await this.lineRepository.save(line);

			await queryRunner.commitTransaction();
			return new ResponseDto(HttpStatus.ACCEPTED, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, updatedLine);
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(
				new ResponseDto(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ResponseCode.INTERNAL_SERVER_ERROR,
					true,
					ResponseMessage.INTERNAL_SERVER_ERROR,
				),
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
