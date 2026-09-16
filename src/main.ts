import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { JwtService } from '@nestjs/jwt';
import { authMiddleware } from './shared/middlewares/auth.middleware.js';
import { DataInterceptor } from './shared/data/data.interceptor.js';


async function bootstrap() {


  const app = await NestFactory.create(AppModule);

  app.use(authMiddleware(app.get(JwtService)))

  // app.useGlobalInterceptors(new DataInterceptor())

  await app.listen(process.env.PORT ?? 3000);


}

await bootstrap();
