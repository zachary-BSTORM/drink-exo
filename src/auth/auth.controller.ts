import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Login } from './dtos/login.dto.js';
import { Register } from './dtos/register.dto.js';

@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService){}


    @Post('login')
    Login(@Body()loginForm : Login){
        return {token : this.authService.login(loginForm)}
        // {token : "qhfqsfqsdfqsdfqQSD98FQS0D9F7QSDDF9QSD8F"}
    }

    @Post('register')
    register(@Body()registerForm : Register){
        return { token : this.authService.register(registerForm)}
    }
}
