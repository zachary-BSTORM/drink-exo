import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    login(loginForm : Login){
        const user = this.userService.findByEmail(loginForm.email) 

        if(!user || user.password != loginForm.password){
            throw new UnauthorizedException('Les informations sont invalides')
        }

        return this.generateToken(user)
    }

    register(registerForm : Register){
        if( registerForm.role){
            const user = this.userService.create({email : registerForm.email , password : registerForm.password,role : registerForm.role})

        }
        const user = this.userService.create({email : registerForm.email , password : registerForm.password})

        return this.generateToken(user)

    }

    generateToken(user : User){
        return this.jwtService.sign({id : user.id , role : user.role})
    }
}
