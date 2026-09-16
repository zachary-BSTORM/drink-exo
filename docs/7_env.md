# Variables d'environnement (.env)

#### Pourquoi

- jamais de secret (mot de passe DB, secret JWT) en dur dans le code : un secret commité est considéré comme compromis
- la configuration change selon l'environnement (dev, prod), pas le code

#### Installation

```bash
npm i @nestjs/config
```

#### Le fichier .env — à la racine (à côté de package.json)

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=motdepasse        ← REMPLACER par le mot de passe PostgreSQL
DB_NAME=order_drink
SECRET=un-secret-jwt          ← la clé de signature des tokens
```

Le `.env` est déjà listé dans le `.gitignore` généré par Nest : il ne sera jamais commité.

#### Chargement — app.module.ts

```ts
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal : true}),   // ← EN PREMIER dans le tableau
    ...
  ],
})
```

- `isGlobal : true` : `ConfigService` devient injectable partout sans devoir réimporter `ConfigModule` dans chaque module

#### Utilisation pour TypeOrm — forRootAsync + ConfigService

```ts
TypeOrmModule.forRootAsync({
  inject : [ConfigService],                    // le service est passé à la factory
  useFactory : (config : ConfigService) => ({
    type : 'postgres',
    host : config.getOrThrow<string>('DB_HOST'),
    port : config.getOrThrow<number>('DB_PORT'),
    username : config.getOrThrow<string>('DB_USERNAME'),
    password : config.getOrThrow<string>('DB_PASSWORD'),
    database : config.getOrThrow<string>('DB_NAME'),
    entities : [Drink,User,Order,OrderItem],
    synchronize : true
  })
}),
```

- `forRootAsync` : la connexion n'est construite qu'au démarrage, une fois le `.env` chargé
- `getOrThrow` : plante immédiatement au démarrage si la variable manque — mieux qu'une erreur obscure plus tard

#### Utilisation pour le JWT — auth.module.ts

```ts
JwtModule.registerAsync({
  useFactory : () => ({
    secret : process.env.SECRET,
    signOptions : {
      expiresIn : '1h'
    }
  })
})
```

Le piège à connaître : les décorateurs `@Module` s'exécutent au moment où les fichiers sont importés — donc avant que `ConfigModule.forRoot()` n'ait chargé le `.env`. La version synchrone :

```ts
JwtModule.register({ secret : process.env.SECRET, ... })   // NE MARCHE PAS
```

capture `secret : undefined` et le premier login échoue avec :

```
Error: secretOrPrivateKey must have a value
```

Avec `registerAsync`, la factory n'est appelée qu'au démarrage de l'application, une fois le `.env` chargé.

#### Le port — main.ts

```ts
await app.listen(process.env.PORT ?? 3000);
```
