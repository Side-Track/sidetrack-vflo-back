import { Module } from '@nestjs/common';
import { CommonsController } from './commons.controller';
import { CommonsService } from './commons.service';

@Module({
  controllers: [CommonsController],
  providers: [CommonsService]
})
export class CommonsModule {}
