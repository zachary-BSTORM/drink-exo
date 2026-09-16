import { Module } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderController } from './order.controller.js';
import { DrinkModule } from '../drink/drink.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drink } from '../drink/entity/drink.model.js';
import { Order } from './entities/order.entity.js';

@Module({
    imports : [TypeOrmModule.forFeature([Order]),DrinkModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
