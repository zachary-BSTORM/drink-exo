# Création d'un crud simple

- commandes séparées

#### controller :
- création d'un controller uniquement

```bash
nest generate controller nom_controller
```

#### service :
- création d'un service uniquement

```bash
nest generate service nom_service
```

#### module :
- création d'un module uniquement

```bash
nest generate module nom_module
```

#### Création du tout en un

- création d'un ensemble controller, module et service avec crud pré-implémenté

```bash
nest generate resource nom_module
```

- choix possibles

```
? What transport layer do you use?
> REST API                        ← notre choix (API HTTP classique)
  GraphQL (code first)
  GraphQL (schema first)
  Microservice (non-HTTP)
  WebSockets

? Would you like to generate CRUD entry points? Yes   ← génère le CRUD complet
```

- ce qui est généré (exemple avec `nest generate resource order`) :

```
src/order/
├── dto/
│   ├── create-order.dto.ts
│   └── update-order.dto.ts
├── entities/
│   └── order.entity.ts
├── order.controller.ts       → routes CRUD pré-implémentées
├── order.service.ts          → méthodes create / findAll / findOne / update / remove
└── order.module.ts
```

Le module est ajouté automatiquement dans les `imports` de app.module.ts.

verifier les imports ils doivent importer le fichier : **.js** à la fin

#### L'entité — le modèle interne

La forme complète de la donnée côté serveur (les décorateurs TypeOrm seront ajoutés à l'étape 6) :

```ts
export class Drink {
    id : number          // généré par le serveur
    nom : string
    type : string
    price : number
    stock : number
    imageurl : string
    createdAt : Date     // généré par le serveur
    exp : Date
}
```

#### Les DTO — ce que le client a le droit d'envoyer ou recevoir ( user => password)

Jamais `id` ni `createdAt` : le client ne les choisit pas.

```ts
export class CreateDrink {
    nom : string
    type : string
    price : number
    stock : number
    imageurl : string
    exp : Date
}

export class UpdateStockDrink {
    stock : number
}
```

#### Le controller — les routes

Version de cette étape, sans les guards (ils arrivent à l'étape 4) :

```ts
@Controller('drink')                    // préfixe : toutes les routes commencent par /drink
export class DrinkController {

    constructor(private drinkService : DrinkService){}   // injection du service

    @Get()                              // GET /drink
    findAll() : Promise<Drink[]>{
        return this.drinkService.findAll()
    }

    @Get(':id')                         // GET /drink/42 → id = 42
    findOne(@Param('id' , ParseIntPipe) id : number) : Promise<Drink>{
        return this.drinkService.findOne(id)
    }

    @Post()                             // POST /drink
    create(@Body() newDrink : CreateDrink) : Promise<Drink> {
        return this.drinkService.create(newDrink)
    }

    @Put(':id')                         // PUT /drink/42
    update(
        @Param('id',ParseIntPipe) id : number,
        @Body() updatedDrink : UpdateDrink
    ) : Promise<Drink>{
        return this.drinkService.update(id,updatedDrink)
    }

    @Put('stock/:id')                   // PUT /drink/stock/42
    updatStock(
        @Param('id' , ParseIntPipe) id : number,
        @Body() updatedStock : UpdateStockDrink
    ) : Promise<Drink>{
        return this.drinkService.updateStock(id,updatedStock)
    }

    @Delete(':id')                      // DELETE /drink/42
    @HttpCode(204)                      // 204 No Content au lieu du 200 par défaut
    delete(@Param('id' , ParseIntPipe) id : number) : Promise<void>{
        return this.drinkService.delete(id)
    }
}
```

- `@Param('id', ParseIntPipe)` : récupère le paramètre d'url et le transforme en number (400 automatique si ce n'est pas un nombre)
- `@Body()` : récupère le body JSON, typé par le DTO
- un POST renvoie 201 par défaut, les autres verbes 200 — modifiable avec `@HttpCode(code)`

#### Le service — la logique métier

Version de départ, en mémoire (remplacée par le Repository TypeOrm à l'étape 6) :

```ts
@Injectable()
export class DrinkService {

    private drinks : Drink[] = []

    findAll() : Drink[] {
        return this.drinks
    }

    findOne(id : number) : Drink {
        const drink = this.drinks.find((drink) => drink.id === id)

        if(!drink){
            throw new NotFoundException(`Aucune boisson avec l'id : ${id}`)   // → 404
        }

        return drink
    }

    create(newDrink : CreateDrink) : Drink {
        const drink : Drink = {
            id : this.drinks.length > 0 ? this.drinks[this.drinks.length - 1].id + 1 : 1,
            ...newDrink,
            createdAt : new Date(),
        }

        this.drinks.push(drink)
        return drink
    }
}
```

- lancer une exception Nest (`NotFoundException`, `BadRequestException`, `ConflictException`, ...) génère automatiquement la bonne réponse HTTP (404, 400, 409, ...)

#### Le module — l'assemblage

```ts
@Module({
    controllers : [DrinkController],
    providers : [DrinkService],
    exports : [DrinkService]      // OrderService en aura besoin
})
export class DrinkModule {}
```
