import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { Response} from 'express'

@Injectable()
export class DataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const response  = context.switchToHttp().getResponse<Response>()

    return next.handle().pipe(
      
      
      map((data) => ({statusCode: response.statusCode , succes : true , data}))
    )
  }
}
