import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service.js';

@Controller('user')
export class UserController {

    constructor(private userService : UserService){}

    @Get(':id')
    findOne(@Param('id',ParseIntPipe) id : number){
        return this.userService.findOne(id)
    }
}
