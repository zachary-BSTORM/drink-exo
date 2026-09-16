# Swagger / OpenAPI

#### Théorie

OpenAPI est un format standard (JSON), indépendant du langage, qui décrit une API REST : routes, verbes, schémas des body, réponses, sécurité. Swagger UI est l'interface interactive générée à partir de cette description.

NestJS génère la spec automatiquement en scannant les décorateurs des controllers — on ne rédige rien à la main, on enrichit avec quelques décorateurs dédiés.

- l'interface : http://localhost:3000/swagger
- la spec brute (JSON) : http://localhost:3000/swagger-json — utilisable pour générer un client (Angular, mobile, ...)

#### Installation

```bash
npm install --save @nestjs/swagger
```

#### Configuration — main.ts

Juste avant le `app.listen` :

```ts
const config = new DocumentBuilder()
  .setTitle('Order Drink API')
  .setDescription('Simple API de gestion de boissons')
  .setVersion('1.0')
  .addBearerAuth()               // ← crée le bouton "Authorize" pour le token JWT
  .build()

const documentFactory = () => SwaggerModule.createDocument(app,config)   // scanne les controllers

SwaggerModule.setup('swagger',app,documentFactory)                       // l'URL de l'interface
```

#### Documenter les body — @ApiProperty sur les DTO

TypeScript efface les types à la compilation : sans décorateur, Swagger affiche des schémas vides. Avec `example`, le bouton « Try it out » pré-remplit le JSON.

```ts
import { ApiProperty } from "@nestjs/swagger";

export class CreateDrink{

    @ApiProperty({example : 'Coca-cola'})
    nom : string

    @ApiProperty({example : 'soda'})
    type : string

    @ApiProperty({example : 2.5})
    price : number

    @ApiProperty({example : 10})
    stock : number

    @ApiProperty({example : 'https://www.src/image.png'})
    imageurl : string

    @ApiProperty({example : '2027-01-01'})
    exp : Date
}
```

À faire sur tous les DTO exposés : `CreateDrink`, `UpdateDrink`, `UpdateStockDrink`, `Login`, `Register`, `CreateOrderDto`.

Cas particulier — un tableau d'objets imbriqués doit déclarer son type explicitement :

```ts
export class CreateOrderDto {
    @ApiProperty({ type : [CreateOrderItemDto] })   // ← sinon Swagger ne connaît pas le contenu
    items : CreateOrderItemDto[]
}
```

#### Marquer les routes protégées — @ApiBearerAuth

`addBearerAuth()` (main.ts) crée le mécanisme ; `@ApiBearerAuth()` dit quelles routes l'utilisent : affiche le cadenas et surtout envoie le token sur ces routes.

```ts
@Post()
@UseGuards(AuthGuard, AdminGuard)
@ApiBearerAuth()                  // ← à ajouter sur chaque route protégée
create(@Body() newDrink : CreateDrink) : Promise<Drink> {
    return this.drinkService.create(newDrink)
}
```

Si tout un controller est protégé, le poser une seule fois sur la classe.

