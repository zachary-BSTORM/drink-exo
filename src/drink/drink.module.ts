import { Module } from '@nestjs/common';
import { DrinkController } from './drink.controller.js';
import { DrinkService } from './drink.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drink } from './entity/drink.model.js';

@Module({
    imports : [TypeOrmModule.forFeature([Drink])],
    controllers : [DrinkController],
    providers : [DrinkService],
    exports : [DrinkService]
})
export class DrinkModule {}
