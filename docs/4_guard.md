# Les guards

#### Théorie

Un guard a une seule responsabilité : décider si une requête sera traitée ou non par le route handler.

- classe `@Injectable()` qui implémente `CanActivate` → une méthode `canActivate(context)` qui retourne un booléen (ou lance une exception)
- `context.switchToHttp().getRequest()` donne accès à la requête — donc au `req.user` posé par le middleware (étape 5)
- `return false` → réponse 403 automatique ; `throw new UnauthorizedException()` → 401

La nuance des codes :

- 401 Unauthorized : « je ne sais pas qui tu es » → pas authentifié
- 403 Forbidden : « je sais qui tu es, tu n'as pas le droit » → authentifié mais pas autorisé

Génération :

- guard simple
```bash
nest generate guard auth
```

- guard dans un dossier spécifique
```bash
nest generate guard shared/guards/auth
```

#### AuthGuard — « es-tu connecté ? »

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest()

    if(!request.user){
      throw new UnauthorizedException('Authentification requise')   // → 401
    }

    return true
  }
}
```

Il ne vérifie pas le token lui-même — c'est déjà fait par le middleware. Il constate juste si `req.user` existe.

#### AdminGuard — « es-tu admin ? »

```ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const {user} = context.switchToHttp().getRequest()

    return user.role === 'admin';    // false → 403
  }
}
```

Le rôle vient du payload du token (posé sur `req.user` par le middleware) — signé, donc infalsifiable sans le secret.

Attention : si la route n'est protégée que par `AdminGuard`, un anonyme n'a pas de `user` → `user.role` plante (erreur 500). Deux solutions :

- chaîner les guards : `@UseGuards(AuthGuard, AdminGuard)` — recommandé, donne les bons codes
- ou sécuriser l'accès : `return user?.role === 'admin'`

#### Utilisation

- sur une action (drink.controller.ts) :

```ts
@Post()
@UseGuards(AuthGuard, AdminGuard)   // évalués dans cet ordre
create(@Body() newDrink : CreateDrink) : Promise<Drink> {
    return this.drinkService.create(newDrink)
}
```

- anonyme → AuthGuard lance 401 (AdminGuard jamais évalué)
- connecté non-admin → AuthGuard passe, AdminGuard retourne false → 403
- admin → les deux passent → handler

- sur une route simplement authentifiée (user.controller.ts) :

```ts
@Get(':id')
@UseGuards(AuthGuard)
findOne(@Param('id',ParseIntPipe) id : number) : Promise<UserDto>{
    return this.userService.findOne(id)
}
```

Les 3 portées possibles :

| Où | Effet |
|---|---|
| `@UseGuards(X)` sur une action | protège cette route |
| `@UseGuards(X)` sur la classe | protège toutes les routes du controller |
| `app.useGlobalGuards(new X())` dans main.ts | protège toute l'application |

