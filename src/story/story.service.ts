import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResponseDto } from 'src/dto/response.dto';
import { ResponseCode } from 'src/response.code.enum';
import { ResponseMessage } from 'src/response.message.enum';
import { Model } from 'mongoose';
import { Story } from './entities/story.entity';
import { User } from 'src/entities/user/user.entity';
import { CreateStoryDto } from './dto/create-stroy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { StoryGenrePair } from './entities/story-genere-pair.entity';
import {Scene} from './entities/scene.entity';
import {Script} from './entities/script.entity';
import {Line} from './entities/line.entity';
import {ChoiceObject} from './entities/choice-object.entity';

@Injectable()
export class StoryService {
	constructor(
		@InjectRepository(Story)
		private storyRepository: Repository<Story>,

		@InjectRepository(StoryGenrePair)
		private storyGenrePairRepository: Repository<StoryGenrePair>,

		@InjectRepository(Scene)
		private sceneRepository : Repository<Scene>,

		@InjectRepository(Script)
		private scriptRepository : Repository<Script>,

		@InjectRepository(Line)
		private lineRepository : Repository<Line>,

		@InjectRepository(ChoiceObject)
		private choiceObjectRepository : Repository<ChoiceObject>
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

	async postStory(user: User, createStoryDto: CreateStoryDto): Promise<ResponseDto> {
		
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.connect();

		await queryRunner.startTransaction();

		try{

			const {title, description, genreList} = createStoryDto;
			const story = this.storyRepository.create({title, description, author : user});
			const createdStory = this.storyRepository.save(story);

			return new ResponseDto(HttpStatus.OK, ResponseCode.SUCCESS, false, ResponseMessage.SUCCESS, createdStory);
		} catch (err) {
			throw new HttpException(
				new ResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, ResponseCode.INTERNAL_SERVER_ERROR, true, ResponseMessage.INTERNAL_SERVER_ERROR, err), HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
