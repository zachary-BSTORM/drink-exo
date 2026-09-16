import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { JwtService } from '@nestjs/jwt';
import { authMiddleware } from './shared/middlewares/auth.middleware.js';
import { DataInterceptor } from './shared/data/data.interceptor.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';



async function bootstrap() {


  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // origin : 'http://localhost:4200',
    // methods : ['GET','POST'],
    // allowsHeaders : ['Content-Type' , 'Authorization'],
    // credentials : true
  })

  app.use(authMiddleware(app.get(JwtService)))

  app.useGlobalInterceptors(new DataInterceptor())

  
  const config = new DocumentBuilder()
  .setTitle('Order Drink API')
  .setDescription('Simple API de gestion de boissons')
  .setVersion('1.0')
  .addBearerAuth()
  .build()

  const documentFactory = () => SwaggerModule.createDocument(app,config)

  SwaggerModule.setup('swagger',app,documentFactory)

  await app.listen(process.env.PORT ?? 3000);


}

await bootstrap();
