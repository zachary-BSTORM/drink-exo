import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { User } from './entity/user.model.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports : [TypeOrmModule.forFeature([User])],
    controllers : [UserController],
    providers : [UserService],
    exports : [UserService]

})
export class UserModule {}
