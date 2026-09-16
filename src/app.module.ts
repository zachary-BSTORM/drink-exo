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

import { ConfigModule,ConfigService } from '@nestjs/config';




@Module({
  imports: [
    ConfigModule.forRoot({isGlobal : true}),
    TypeOrmModule.forRootAsync({
      inject : [ConfigService],
      useFactory : (config : ConfigService) => ({
      type : 'postgres',
      host : config.getOrThrow<string>('DB_HOST'),
      port : config.getOrThrow<number>('DB_PORT'),
      username : config.getOrThrow<string>('DB_USERNAME'),
      password : config.getOrThrow<string>('DB_PASSWORD'),
      database : config.getOrThrow<string>('DB_NAME'),
      entities : [Drink,User,Order,OrderItem],
      synchronize : true
      })
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
