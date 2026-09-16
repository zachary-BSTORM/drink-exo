import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.model.js';
import { CreateUser } from './dto/create-user.dto.js';
import { UserDto } from './dto/user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

constructor(
    @InjectRepository(User)
    private readonly userRepository : Repository<User>
){}

async create(newUser : CreateUser): Promise<User> {

if(await this.findByEmail(newUser.email)){
    throw new ConflictException(`Email ${newUser.email} déja utilisé`)
}

const user = this.userRepository.create({
        email : newUser.email,
        password : newUser.password,
        role : newUser.role 
    })

    return this.userRepository.save(user)

}

findByEmail(email : string) : Promise<User | null>{
   return  this.userRepository.findOne({where : {email}})
}

async findOne(id : number): Promise<UserDto>{
    const user = await this.userRepository.findOne({where : {id}})

    if(!user){
        throw new NotFoundException(`Aucun utilisateur avec l'id : ${id}`)
    }

    const userDto : UserDto = {
        id : user.id,
        email : user.email,
        role : user.role,
        createdAt : user.createdAt
    }

    return userDto
}
}
