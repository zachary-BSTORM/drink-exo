import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { AuthGuard } from '../shared/guards/auth.guard.js';
import { UserDto } from './dto/user.dto.js';

@Controller('user')
export class UserController {

    constructor(private userService : UserService){}

    @Get(':id')
    @UseGuards(AuthGuard)
    findOne(@Param('id',ParseIntPipe) id : number) : Promise<UserDto>{
        return this.userService.findOne(id)
    }
}
