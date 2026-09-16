# Les middlewares

#### Théorie

Un middleware est une fonction exécutée avant le route handler. Il reçoit :

- `req` : la requête (modifiable)
- `res` : la réponse
- `next` : la fonction qui passe à l'étape suivante

Il peut exécuter du code, modifier la requête, puis appeler `next()` pour continuer — ou répondre lui-même. S'il ne fait ni l'un ni l'autre, la requête reste bloquée (« pending »).

Cycle de vie d'une requête :

```
requête → middleware → guard → interceptor → handler → interceptor → réponse
```

#### Notre middleware d'authentification — shared/middlewares/auth.middleware.ts

Son rôle : pour chaque requête, décoder le token s'il y en a un et poser le payload sur `req.user`. La décision d'accepter ou non la requête appartient aux guards (étape 4).

```ts
export function authMiddleware(jwtService : JwtService){
  return (req : Request , res : Response , next  : NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ' , '')

    if(!token){
      return next()          // pas de token → on continue SANS user (routes publiques ok)
    }

    try{
        const payload = jwtService.verify(token)     // vérifie la signature + l'expiration

        Object.assign(req , {user : payload})        // pose { id, role } sur req.user
        next()
    }catch{
      return res.status(401).send('Invalid token')   // token présent mais invalide/expiré
    }
  }
}
```

- c'est une « factory » : la fonction externe reçoit le `JwtService` et retourne le vrai middleware. Nécessaire car le middleware est branché dans main.ts, hors injection de dépendances

- le token arrive dans le header `Authorization: Bearer eyJhbGci...` → `.replace('Bearer ', '')` isole le token

- `jwtService.verify` relit le token avec le même secret que la génération : payload retourné si valide, exception sinon

#### Branchement — main.ts

Middleware global : s'applique à toutes les routes.

```ts
const app = await NestFactory.create(AppModule);

app.use(authMiddleware(app.get(JwtService)))
```

- `app.get(JwtService)` : récupère l'instance configurée dans AuthModule (même secret)

#### Alternative : middleware sous forme de classe

Pour un middleware limité aux routes d'un module (non utilisé dans ce projet) :

```ts
@Injectable()
export class MyMiddleware implements NestMiddleware {
  use(req : Request, res : Response, next : NextFunction) {
    next();
  }
}

export class SomeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MyMiddleware).forRoutes('*');
  }
}
```

Génération :

```bash
nest generate middleware shared/middlewares/auth
```
