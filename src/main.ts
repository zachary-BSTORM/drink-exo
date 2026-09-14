import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { JwtService } from '@nestjs/jwt';
import {Request,Response,NextFunction} from 'express'


function authMiddleware(jwtService : JwtService){
  return (req : Request , res : Response , next  : NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ' , '')

    if(!token){
      return next()
    }

    try{
        const payload = jwtService.verify(token)

        Object.assign(req , {user : payload})
        next()
    }catch{
      return res.status(401).send('Invalid token')
    }
  }
}

async function bootstrap() {


  const app = await NestFactory.create(AppModule);

  app.use(authMiddleware(app.get(JwtService)))

  await app.listen(process.env.PORT ?? 3000);


}


await bootstrap();
