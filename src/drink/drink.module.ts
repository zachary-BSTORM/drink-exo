import { Module } from '@nestjs/common';
import { DrinkController } from './drink.controller.js';
import { DrinkService } from './drink.service.js';

@Module({
    controllers : [DrinkController],
    providers : [DrinkService]
})
export class DrinkModule {}
