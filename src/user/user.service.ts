import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.model.js';
import { CreateUser } from './dto/create-user.dto.js';

@Injectable()
export class UserService {

private users : User[] = []
lastId = 0;

create(newUser : CreateUser): User{
    if(this.findByEmail(newUser.email)){
        throw new ConflictException(`Email ${newUser.email} déja utilisé`)
    }

    const user : User = {
        id : this.lastId + 1,
        email : newUser.email,
        password : newUser.password,
        role : newUser.role ?? "user",
        createdAt : new Date()
    }

    this.users.push(user)
    return user

}

findByEmail(email : string) : User | undefined{
    return this.users.find(u => u.email == email)
}

findOne(id : number): User{
    const user = this.users.find(u => u.id == id)

    if(!user){
        throw new NotFoundException(`Utilisateur introuvable avec l'id ${id}`)
    }

    return user
}

}
