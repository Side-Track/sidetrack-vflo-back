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
									text: '내 눈앞에 있는 새하얀 산맥. 어느정도나 걸었을까..',
								},
								{
									id: 122,
									text: '침엽수림을 한참을 지나, 이젠 나무조차 보이지 않게 되었다.',
								},
							],
							isLinked: 25,
						},
						25: {
							id: 25,
							lineList: [
								{
									id: 140,
									text: '갑자기 천지가 진동하듯 흔들리기 시작했다.',
									assets: [],
									Effect: [],
								},
								{
									id: 144,
									text: '(이, 이건 산사태..?)',
								},
							],
							isLinked: 42,
						},
						42: {
							id: 42,
							lineList: [
								{
									id: 147,
									text: '당신 앞에는 물건이 놓여있다. 어떤 것을 선택할 것인가.',
								},
							],
							choiceList: [
								{
									text: '다 쓰고 버려진 페트병',
									linkedSceneId: 37,
								},
								{
									text: '누군가 버리고 간 낙하산 줄',
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
									text: '이건.. 페트평? 물! 물을 찾아야해..',
								},
								{
									id: 154,
									text: '저 밑에 호수가 있잖아?',
								},
							],
							isLinked: 69,
						},
						69: {
							id: 69,
							lineList: [
								{
									id: 157,
									text: '호수에 가까이 다가갔고, 나는 그제서야 갈증을 해소할 수 있었다.',
								},
								{
									id: 158,
									text: '갈증이 해소되고서야 주위를 둘러볼 여유가 생겼다.',
								},
								{
									id: 159,
									text: '저기.. 괜찮으신가요?',
								},
							],
							isLinked: 72,
						},
						72: {
							id: 72,
							lineList: [
								{
									id: 171,
									text: '그녀에게 대답한다.',
								},
							],
							choiceList: [
								{
									text: '아 괜찮습니다! 걱정하지 않으셔도 되요.',
									linkedSceneId: 41,
								},
								{
									text: '여기가 어디죠?',
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
									text: '그녀는 당신을 두고 가버렸습니다.',
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
									text: '그녀는 당신에게 손을 내밀었고, 그녀는 당신을 데리고 한 마을로 향했습니다.',
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
			// Dto 로 부터 필요한 정보 가져움
			const { title, description } = createStoryDto;
			const genreList = createStoryDto.genre_list;

			// Story entity 생성
			const story = this.storyRepository.create({ title, description, author: user, last_update_date: new Date() });
			// Story 저장
			const createdStory: Story = await this.storyRepository.save(story);

			// 스토리 생성 시 장르를 같이 설정한 경우
			if (genreList != undefined || genreList.length > 0) {
				// 장르 리스트 가져오기
				const selectedGenreList: Genre[] = await this.commonsService.getGenreListByIdList(genreList);

				// 스토리-장르 엔티티 배열 생성
				const storyGenreList: StoryGenrePair[] = [];
				for (let i in selectedGenreList) {
					storyGenreList.push(
						this.storyGenrePairRepository.create({
							story: createdStory,
							genre: selectedGenreList[i],
						}),
					);
				}

				// 스토리-장르 엔티티 저장
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

		// ManyToOne 관계로 정립된 경우, Many쪽에서 One 쪽 엔티티 조인하여 찾을 때 relations 필드에 ManyToOne 컬럼명을 넣는다.
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
			// 기존 페어 모두 삭제
			await this.storyGenrePairRepository.delete({ story });

			// 장르 새로 받아옴
			const selectedGenreList: Genre[] = await this.commonsService.getGenreListByIdList(genreList);

			// 스토리-장르 엔티티 배열 생성
			const storyGenreList: StoryGenrePair[] = [];
			for (let i in selectedGenreList) {
				storyGenreList.push(
					this.storyGenrePairRepository.create({
						story: story,
						genre: selectedGenreList[i],
					}),
				);
			}

			// 스토리-장르 엔티티 저장
			const createdStoryGenrePairList = await this.storyGenrePairRepository.save(storyGenreList);

			// 스토리 마지막 수정일
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
		// storyId 로 부터 스토리 가져옴
		const story: Story = await this.storyRepository.findOne({ relations: ['author'], where: { id: storyId } });

		// 스토리 존재하지 않으면 throw
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

		// scene 이 존재하지 않을 때
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

		// 스토리가 존재하지 않을 때
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

		// 스토리의 저자가 아닐 때
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

		// scene 이 존재하지 않을 때
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

		// 스토리가 존재하지 않을 때
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

		// 스토리의 저자가 아닐 때
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

			// script 엔티티 생성 및 저장
			const script = this.scriptRepository.create({ scene: scene, is_choice: isChoice });
			const createdScript = await this.scriptRepository.save(script);

			// 생성된 script 는 모든 외래키 조인되어 있기 때문에 조인 된 부분 제거하고 리턴
			if (createdScript) {
				delete createdScript.scene;
			}

			// 해당 스크립트가 선택형 스크립트일 경우

			// 선택지 저장할 배열 선언
			const tempChoiceObjectList: ChoiceObject[] = [];
			let createdChoiceObjectList: ChoiceObject[] = [];
			if (isChoice) {
				// 선택지 엔티티 생성 및 저장
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

				// createdChoiceObjectList 원소 내에 필요한 모든 부분을 조인해서 가져오기 때문에 조인된 부분 제거하고 리턴
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
		// 유효성 검사 로직
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

		// 선택지 생성 가능 스크립트가 아닐 떄
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

		// 존재하지 않는 scene number를 링크 하려고 할 떄 ====
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

		// choice object Entity 생성 및 save
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
}
