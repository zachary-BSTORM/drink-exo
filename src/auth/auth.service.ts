import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { Login } from './dtos/login.dto.js';
import { Register } from './dtos/register.dto.js';
import { User } from '../user/entity/user.model.js';
import { JwtService } from '@nestjs/jwt';

// npm install @nestjs/jwt
@Injectable()
export class AuthService {

    constructor(
        private userService : UserService,
        private jwtService : JwtService
    ){}

    async login(loginForm : Login){
        const user = await this.userService.findByEmail(loginForm.email) 

        if(!user || user.password != loginForm.password){
            throw new UnauthorizedException('Les informations sont invalides')
        }
        
        return await this.generateToken(user)
    }

    async register(registerForm : Register){
        let user : User | null = null
        if (registerForm.role){
            user = await this.userService.create({email : registerForm.email , password : registerForm.password,role : registerForm.role})

        }else{
            user = await this.userService.create({email : registerForm.email , password : registerForm.password})
        }
        
        
        if(!user){
            throw new BadRequestException("Erreur lors de l'enregistrement")
        }
                return await this.generateToken(user)


    }

    generateToken(user : User){
        return this.jwtService.signAsync({id : user.id , role : user.role})
    }
}
