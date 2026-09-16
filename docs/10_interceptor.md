# L'interceptor — mise en forme des réponses

#### Théorie

Un interceptor entoure l'exécution du route handler : il peut agir avant ET après — c'est sa différence avec le middleware (avant seulement) et le guard (avant, décision binaire).

```
requête → middleware → guard → [ interceptor → handler → interceptor ] → réponse
```

- classe `@Injectable()` qui implémente `NestInterceptor` → méthode `intercept(context, next)`
- `next.handle()` retourne un `Observable` (RxJS) : le flux de la réponse. C'est en le retournant que le handler est appelé
- on se branche sur ce flux avec `.pipe(...)` :
  - `map(fn)` : transforme la réponse — ce que `fn` retourne remplace ce que le handler a retourné (notre cas)
  - `tap(fn)` : observe sans modifier (ex : logging, mesure du temps)

Usages typiques : formater toutes les réponses pareil, logger, mettre en cache.

#### Le DataInterceptor — shared/data/data.interceptor.ts

Objectif : toutes les réponses de l'API ont le même format `{ statusCode, success, data }`.

```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { Response } from 'express'

@Injectable()
export class DataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const response = context.switchToHttp().getResponse<Response>()   // la réponse Express

    return next.handle().pipe(
      map((data) => ({statusCode : response.statusCode , success : true , data}))
    )
  }
}
```

- le `data` reçu par `map` = ce que le controller a retourné ; l'objet retourné = ce que le client reçoit
- `getResponse<Response>()` permet de lire le `statusCode` de la réponse en cours

#### Les deux pièges

- `import type { Response } from 'express'` est obligatoire : sans lui, `Response` désigne le type du navigateur (API fetch) qui a un `status` mais pas de `statusCode` → erreur TS « La propriété 'statusCode' n'existe pas sur le type 'Response' »
- fonction fléchée qui retourne un objet : il faut des parenthèses autour de l'objet — `map((data) => ({ ... }))` — sinon `{ }` est lu comme un corps de fonction

#### Branchement — main.ts

Global : s'applique à toutes les routes.

```ts
app.useGlobalInterceptors(new DataInterceptor())
```

Autres portées possibles : `@UseInterceptors(X)` sur un controller ou une action.

#### Résultat

Sur `GET /drink/1` :

```json
// le controller retourne
{ "id": 1, "nom": "Coca-cola", "price": 2.5 }

// le client reçoit
{ "statusCode": 200, "success": true, "data": { "id": 1, "nom": "Coca-cola", "price": 2.5 } }
```

- `DELETE /drink/:id` répond `204 No Content` → pas de body du tout, l'enveloppe n'apparaît pas pour cette route (normal)

Génération :

```bash
nest generate interceptor shared/data/data
```
