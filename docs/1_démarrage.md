# Création du projet

#### Installation de nest

Le CLI NestJS s'installe une seule fois, globalement :

```bash
npm install -g @nestjs/cli
```

Création du projet (choisir npm comme package manager quand la question est posée) :

```bash
nest new drink-exo
```

Lancement en mode développement (recompile et redémarre à chaque sauvegarde) :

```bash
npm run start:dev
```

L'API écoute sur http://localhost:3000

#### Structure du projet

```
drink-exo/
├── node_modules/        → les dépendances installées
├── src/                 → le code de l'application
├── test/                → les tests e2e
├── dist/                → le code compilé en JavaScript (généré par nest build)
├── nest-cli.json        → configuration du CLI NestJS
├── package.json         → dépendances + scripts npm (start:dev, build, test, ...)
├── tsconfig.json        → configuration TypeScript
└── .gitignore           → fichiers exclus de git (node_modules, dist, .env, ...)
```

#### Structure de l'application (src/)

Au départ, le CLI génère :

```
src/
├── main.ts              → point d'entrée : démarre l'application
├── app.module.ts        → le module racine (root)
├── app.controller.ts    → un controller d'exemple
└── app.service.ts       → un service d'exemple
```

- Le fichier main

C'est le premier fichier exécuté : il crée l'application à partir du module root et écoute un port.

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
```

Ce fichier s'enrichira au fil des étapes (middleware, interceptor, cors, swagger).

#### Les 3 briques d'une application Nest

- controller : reçoit les requêtes HTTP et renvoie les réponses. Classe annotée `@Controller('prefix')`, chaque méthode est une route (`@Get()`, `@Post()`, ...).

- service (provider) : contient la logique métier. Classe annotée `@Injectable()`, injectée dans les controllers par le constructeur.

- module : assemble controllers et services d'une fonctionnalité. Classe annotée `@Module()`.

```ts
@Module({
  imports : [],      // les modules importés
  controllers : [],  // les controllers du module
  providers : [],    // les services du module
  exports : []       // les providers rendus disponibles aux autres modules
})
```

- exemple du projet : le module root importe les modules « feature » (un module par fonctionnalité) :

```ts
@Module({
  imports: [DrinkModule, UserModule, AuthModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- encapsulation : un provider n'est injectable que dans son propre module. Pour l'utiliser ailleurs, il faut l'ajouter aux `exports`.
  Exemple du projet : `DrinkModule` exporte `DrinkService` pour que `OrderService` puisse vérifier les stocks.
