# Projet Drink

## 1. Drink

### Models : Entity et Dtos

Configuration de modèles pour chaque besoin.

**Entity : modèle complet**

```ts
export class Drink{
    id : number
    nom : string
    type : string
    price : number
    stock : number
    imageurl : string
    createdAt : Date
    exp : Date
}
```

**DTO : modèle pour un besoin spécifique ( create - update - ... )**

```ts
export class CreateDrink{
    nom : string
    type : string
    price : number
    stock : number
    imageurl : string
    exp : Date
}
```

```ts
export class UpdateDrink{
    nom : string
    price : number
    stock : number
    imageurl : string
}
```

```ts
export class UpdateStockDrink{
    stock : number
}
```

### Service : logique ( CRUD ) et une collection en dur dans le service

Pour l'instant nous travaillons sur une liste de données en dur dans le service, en attendant l'utilisation d'une base de données.

```ts
drinks : Drink[] = []

lastId = 0


findAll() : Drink[]{
    return this.drinks;
}

findOne(id : number) : Drink {
    const drink = this.drinks.find(d => d.id === id)

    if(!drink){
        throw new NotFoundException(`Aucune boisson avec l'id : ${id}`) // altgr + µ
    }

    return drink
}

create(newDrink : CreateDrink) : Drink {
    this.lastId++

    const drink : Drink = {
        id : this.lastId,
        nom : newDrink.nom,
        price : newDrink.price,
        stock : newDrink.stock,
        imageurl : newDrink.imageurl,
        exp : newDrink.exp,
        type : newDrink.type,
        createdAt : new Date()
    }

    this.drinks.push(drink)

    return drink
}

update(id : number , updatedDrink : UpdateDrink) : Drink {
    const drink = this.findOne(id)
    Object.assign(drink,updatedDrink)
    return drink

}

updateStock(id : number , updatedStock : UpdateStockDrink) : Drink {
    const drink = this.findOne(id)

    if(updatedStock.stock < 0){
        throw new BadRequestException(`Le stock ne peut pas être négatif , valeur incorrecte : ${updatedStock.stock}`)
    }

    Object.assign(drink,updatedStock)
    return drink
}

delete(id : number) : void {
    const index = this.drinks.findIndex(d => d.id === id)

    if(index === -1){
        throw new NotFoundException(`Aucune boisson avec l'id : ${id}`)
    }

    this.drinks.splice(index,1)
}
```

### Controller : définition des verbes utilisés et récupération des informations depuis la route ou le body

- Le contrôleur permet de lier un verbe à une action provenant de notre service
- Il peut également récupérer des informations au niveau de la route et du body
- On injecte le service pour pouvoir accéder à ses méthodes

**Sans paramètres**

```ts
@Get()
findAll() : Drink[]{
    return this.drinkService.findAll()
}
```

**Avec paramètre de la route**

- Un pipe permet de valider et convertir une valeur = ParseIntPipe
- Récupérer le paramètre de la route = @Param('nom')
- Instance pour la manipulation = id : number

```ts
@Get(':id')
findOne(@Param('id' , ParseIntPipe) id : number) : Drink{
    return this.drinkService.findOne(id)
}
```

### Module : permet de regrouper une logique en un « module » qui peut lui-même être appelé dans un autre (ex : app.module.ts)

Le module permet de regrouper une logique en un endroit. Pour l'instant il permet de n'avoir que le module à déclarer dans le app.module principal.

Il peut contenir plusieurs informations :

```ts
imports     : [],   // les autres modules dont celui-ci dépend
controllers : [],   // les controllers du module
providers   : [],   // les services injectables du module
exports     : []    // les providers rendus accessibles aux modules qui importent celui-ci
```

Exemple de module Drink, uniquement controllers et providers :

```ts
@Module({
    controllers : [DrinkController],
    providers : [DrinkService]
})
export class DrinkModule {}
```

Ajout du module Drink dans le module principal : AppModule.

## 2. User

### Service : implémentation de la logique propre aux utilisateurs : findByEmail - create - findOne

- Le UserService va être utilisé dans le AuthService, ce qui permet d'utiliser les méthodes associées pour gérer le login et le register
- Il devra donc être exporté au niveau du UserModule

### Controller : une seule route pour l'instant, findOne

- Injection du service pour pouvoir l'appeler
- Ne nécessite pour l'instant que le findOne ( Update et Delete pourront s'ajouter ensuite )

### Module : regroupe les éléments de base, controller et service, mais ajoute une nouveauté : il exporte UserService car il sera utilisé dans le AuthService

Premier partage de service au travers de l'application : il faut donc définir un paramètre supplémentaire, ce qu'on exporte.

```ts
@Module({
    imports : [],
    controllers : [UserController],
    providers : [UserService],
    exports : [UserService] // ici on rend le UserService accessible en l'exportant

})
export class UserModule {}
```

Ajout du module User dans le module principal : AppModule.

## 3. Auth

Pour la gestion de l'authentification on utilise le module fourni par Nest : **@nestjs/jwt** ( JwtModule pour la configuration + JwtService pour créer/vérifier les tokens ).

Installation de @nestjs/jwt :

```bash
npm install @nestjs/jwt
```

### Service : permet de gérer la logique d'authentification : login - register - generateToken

- Ici on injecte le UserService pour pouvoir appeler les méthodes prévues pour l'authentification : findByEmail - create
- On injecte également le JwtService pour utiliser la méthode « sign » qui permet de créer le token

```ts
constructor(
    private userService : UserService,
    private jwtService : JwtService
){}
```

Les méthodes login et register font appel au UserService pour vérifier certaines informations ( est-ce que l'email existe , ... ) :

```ts
register(registerForm : Register){
    const user = this.userService.create({
        email : registerForm.email ,
        password : registerForm.password,
        role : registerForm.role
    })

    return this.generateToken(user)
}
```

( si role n'est pas fourni , le UserService applique le défaut : `role ?? "user"` )

### Controller : uniquement login et register

- Injection du service AuthService
- Définition des endpoints :
  - POST : login
  - POST : register

### Module : configuration de base avec AuthController et AuthService, mais nouveauté : contient plusieurs imports ( UserModule , JwtModule et sa configuration )

Le AuthModule utilise plusieurs éléments importés :

- Le UserModule pour accéder au UserService
- Le JwtModule qui permet la configuration du JWT

```ts
@Module({
imports : [UserModule,
    JwtModule.register({
    secret : '7DS809QS7F9QDSF7QSDF7QSD89F7QSD0F7',
    signOptions : {
        expiresIn : '1h'
    }
    })

],
controllers : [AuthController],
providers: [AuthService]
})
export class AuthModule {}
```

Ajout du module Auth dans le module principal : AppModule.

### Guard : permet de vérifier qu'une condition est respectée avant d'autoriser l'accès

- Le premier guard permet de vérifier que l'utilisateur est bien authentifié avant d'autoriser l'accès à la route
- Ici on vérifie la présence d'un user au niveau de la requête, qui n'est pas présent par défaut
- Il sera ajouté grâce à un middleware dans l'étape suivante

```ts
@Injectable()
export class AuthGuard implements CanActivate {
canActivate(context: ExecutionContext, ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest()

    if(!request.user){
    throw new UnauthorizedException('Authentification requise')
    }

    return true

}
}
```

Il peut être appelé sur une route spécifique :

```ts
@Post()
@UseGuards(AuthGuard)
create(@Body() newDrink : CreateDrink) : Drink{
    return this.drinkService.create(newDrink)
}
```

Ou sur un contrôleur complet :

```ts
@Controller('drink')
@UseGuards(AuthGuard)
export class DrinkController {
}
```

### Middleware : permet d'effectuer une action en laissant passer la requête si voulu

- Nous permet de récupérer le token, de **vérifier sa signature et de le décoder** ( un JWT n'est pas chiffré : son payload est lisible , la signature garantit qu'il n'a pas été falsifié ) , et d'ajouter dans la requête entrante un user qui sera nécessaire pour la vérification du guard
- Un middleware effectue un traitement et peut :
  - effectuer une action sur la requête : req
  - renvoyer une réponse : res
  - laisser passer la requête : next

```ts
function authMiddleware(jwtService : JwtService){
    return (req : Request , res : Response , next  : NextFunction) => {

        // récupération du token dans le header et suppression du mot Bearer
        const token = req.headers.authorization?.replace('Bearer ' , '')


        // si pas de token, la requête continue telle quelle
        if(!token){
        return next()
        }

        // tentative de récupération des informations dans le payload du token
        try{

            // utilisation de jwtService qui permet de vérifier le token et récupérer son payload
            const payload = jwtService.verify(token)

            // ajout d'un user à la requête pour permettre au guard de savoir si l'utilisateur est connecté
            Object.assign(req , {user : payload})

            // la requête suit son cours
            next()

        }catch{

        // si une erreur survient c'est que le token n'est pas valide : on renvoie une réponse pour indiquer que la requête est refusée
        return res.status(401).send('Invalid token')
        }
    }
}
```

Ensuite on configure au niveau de **main.ts** que lors d'une requête entrante il faut effectuer un traitement en utilisant le middleware :

```ts
async function bootstrap() {


const app = await NestFactory.create(AppModule);

// ici on demande à notre instance app d'utiliser notre middleware
app.use(authMiddleware(app.get(JwtService)))

await app.listen(process.env.PORT ?? 3000);


}


await bootstrap();
```

# Suite de l'exercice pour la journée

- Implémenter un OrderModule avec :
  - Entity    : Order
  - Dtos      : create - update
  - Service   : CRUD avec utilisation de DrinkService
  - Controller: CRUD
  - Module    : vérifier les imports et les exports du DrinkModule

- Le OrderService devra tenir compte du stock des boissons et le mettre à jour

- Il faut limiter l'accès aux utilisateurs connectés

# Bonus

## Bonus 1 — Qui suis-je ? ( GET /auth/me )

Ajouter dans le AuthController une route **GET /auth/me**, protégée par le AuthGuard, qui renvoie les informations de l'utilisateur **actuellement connecté**.

- L'id de l'utilisateur se trouve dans `req.user` ( posé par le middleware ) → utiliser `@Req()`
- Récupérer l'utilisateur complet avec `userService.findOne(...)`
- Ne **jamais** renvoyer le password dans la réponse

Vérification : appeler la route avec le token de deux comptes différents → chacun ne voit que ses propres informations ; sans token → 401.

## Bonus 2 — AdminGuard

Créer un deuxième guard, **AdminGuard**, qui vérifie que l'utilisateur connecté a le rôle `admin` :

```ts
const user = request.user
return user && user.role === 'admin'
```

- Le poser ( en plus du AuthGuard ) sur les routes d'écriture des boissons : create , update , updateStock , delete
- La lecture ( findAll , findOne ) reste accessible à tous
- Pour se créer un admin de test : le register accepte un champ `role`

À observer : quand le guard retourne `false`, Nest renvoie **403 Forbidden** ( « je sais qui tu es, tu n'as pas le droit » ) — alors que le AuthGuard lance un **401 Unauthorized** ( « je ne sais pas qui tu es » ). Tester les deux cas dans Postman.

## Bonus 3 — Compléter le UserController ( mon compte uniquement )

Ajouter **PUT /user/:id** et **DELETE /user/:id** ( + les méthodes update et delete dans le UserService ), protégées par le AuthGuard, avec la règle :

> Un utilisateur ne peut modifier ou supprimer que **son propre** compte.

- Comparer l'id de la route ( `@Param` ) avec `req.user.id`
- S'ils sont différents → `throw new ForbiddenException(...)` ( slide 37 )
- Pour l'update : penser à vérifier l'unicité de l'email si celui-ci change

Vérification : modifier son propre compte → 200 ; tenter de modifier le compte d'un autre → 403.

## Bonus 4 — Audit des codes HTTP

Passer en revue **toutes** les routes de l'application et corriger les codes de statut :

- `DELETE /drink/:id` et `DELETE /user/:id` → **204 No Content** avec `@HttpCode(204)` ( succès sans body )
- `POST /auth/login` → **200** avec `@HttpCode(200)` — un POST renvoie 201 « Created » par défaut, or un login ne crée rien
- `POST /auth/register` → 201 est correct ( on crée bien un utilisateur )

Vérification dans Postman : chaque réponse doit porter le bon code — 200 / 201 / 204 / 400 / 401 / 403 / 404 / 409 selon le cas.
