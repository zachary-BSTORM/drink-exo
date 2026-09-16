# Configuration du Jwt et génération de token

#### Installation

```bash
npm install @nestjs/jwt
```

#### Théorie rapide

Un JWT est composé de 3 blocs encodés en base64url, séparés par des points :

```
header.payload.signature
```

- header : l'algorithme de signature
- payload : les données embarquées (ici `{ id, role }`) + la date d'expiration
- signature : hash du header + payload + le secret

Le payload est lisible par tout le monde (base64 n'est pas du chiffrement — coller un token sur jwt.io pour le voir). La signature garantit qu'il n'a pas été modifié : impossible de changer `role : 'user'` en `'admin'` sans connaître le secret. Donc jamais de donnée sensible dans un payload.

#### Configuration — auth.module.ts

```ts
@Module({
  imports : [UserModule,                    // pour injecter UserService
    JwtModule.registerAsync({
      useFactory : () => ({
        secret : process.env.SECRET,        // clé de signature ET de vérification (voir 7_env.md)
        signOptions : {
          expiresIn : '1h'                  // durée de vie des tokens
        }
      })
    })
  ],
  controllers : [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
```

- `registerAsync`  : le secret vient du `.env`, qui n'est pas encore chargé au moment où ce fichier est évalué 

- une fois configuré, `JwtService` est injectable dans tout le module, déjà paramétré

#### Le service — auth.service.ts

```ts
@Injectable()
export class AuthService {

    constructor(
        private userService : UserService,
        private jwtService : JwtService
    ){}

    async login(loginForm : Login){
        const user = await this.userService.findByEmail(loginForm.email)

        if(!user || user.password != loginForm.password){
            throw new UnauthorizedException('Les informations sont invalides')   // → 401
        }

        return await this.generateToken(user)
    }

    async register(registerForm : Register){
        const user = await this.userService.create({
            email : registerForm.email,
            password : registerForm.password
        })
        // le ConflictException (409) « email déjà utilisé » remonte depuis UserService

        return await this.generateToken(user)
    }

    generateToken(user : User){
        return this.jwtService.signAsync({id : user.id , role : user.role})   // le payload
    }
}
```

- `signAsync` renvoie une `Promise<string>` → `await` dans les méthodes appelantes
- le payload `{ id, role }` sera relu par le middleware (étape 5) puis par les guards (étape 4)
- dans `login`, le même message d'erreur pour « email inconnu » et « mauvais mot de passe » : on ne révèle pas quels emails existent

#### Le controller — auth.controller.ts

Routes publiques (il faut bien pouvoir obtenir un token sans en avoir un) :

```ts
@Controller('auth')
export class AuthController {

    constructor(private authService : AuthService){}

    @Post('login')                       // POST /auth/login
    async Login(@Body() loginForm : Login){
        return {token : await this.authService.login(loginForm)}
    }

    @Post('register')                    // POST /auth/register
    async register(@Body() registerForm : Register){
        return { token : await this.authService.register(registerForm)}
    }
}
```

Les DTO :

```ts
export class Login {
    email : string;
    password : string;
}
```

— à envoyer ensuite dans le header `Authorization: Bearer <token>`.
