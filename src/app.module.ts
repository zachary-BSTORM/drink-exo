import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DrinkModule } from './drink/drink.module.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OrderModule } from './order/order.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drink } from './drink/entity/drink.model.js';
import { User } from './user/entity/user.model.js';
import { Order, OrderItem } from './order/entities/order.entity.js';




@Module({
  imports: [
    TypeOrmModule.forRoot({
      type : 'postgres',
      host : 'localhost',
      port : 5432,
      username : 'postgres',
      password : 'admin1234',
      database : 'order-drink',
      entities : [Drink,User,Order,OrderItem],
      synchronize : true
    }),
    DrinkModule, 
    UserModule,
    AuthModule, 
    OrderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
