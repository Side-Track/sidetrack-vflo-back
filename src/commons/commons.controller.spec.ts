import { Test, TestingModule } from '@nestjs/testing';
import { CommonsController } from './commons.controller';

describe('CommonsController', () => {
  let controller: CommonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommonsController],
    }).compile();

    controller = module.get<CommonsController>(CommonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
