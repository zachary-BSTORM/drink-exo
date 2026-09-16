# Hashage des mots de passe avec bcrypt

#### Pourquoi

Actuellement les mots de passe sont stockés en clair dans la base : si la base fuite (ou si un admin la consulte), tous les comptes sont compromis — y compris sur les autres sites où les utilisateurs réutilisent le même mot de passe.

La règle : on ne doit jamais pouvoir retrouver un mot de passe. On stocke donc un hash.

- un hash n'est pas du chiffrement : c'est à sens unique, il n'existe pas de « déhashage »
- au login, on ne compare jamais les mots de passe : on hash ce que le client envoie et on compare les hash
- bcrypt est un algorithme conçu pour les mots de passe :
  - lent exprès → freine le brute force (contrairement à SHA/MD5, faits pour être rapides)
  - salé → deux utilisateurs avec le même mot de passe ont des hash différents ; le salt est inclus dans le hash produit, rien à stocker à part

#### Installation

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

#### Les deux fonctions à connaître

```ts
import bcrypt from 'bcrypt';   // piège ESM : import par défaut, pas « import * as »

const hash = await bcrypt.hash(motDePasse, 10);              // hasher (10 = salt rounds, le coût)
const ok = await bcrypt.compare(motDePasseEnClair, hash);    // comparer → true / false
```

- `hash` à l'inscription, avant de sauver
- `compare` au login — jamais de `===` entre un mot de passe et un hash
- les deux renvoient une `Promise` → `await`

#### Modification 1 — user.service.ts : hasher à la création

Toute création d'utilisateur passe par `UserService.create` : on hash à cet endroit unique.

Avant (code actuel) :

```ts
const user = this.userRepository.create({
    email : newUser.email,
    password : newUser.password,
    role : newUser.role
})

return this.userRepository.save(user)
```

Après :

```ts
const hash = await bcrypt.hash(newUser.password, 10)   // la méthode est déjà async

const user = this.userRepository.create({
    email : newUser.email,
    password : hash,                                   // on stocke le hash, jamais le clair
    role : newUser.role
})

return this.userRepository.save(user)
```

Ne pas oublier l'import en haut du fichier :

```ts
import bcrypt from 'bcrypt';
```

#### Modification 2 — auth.service.ts : comparer au login

Avant (code actuel) :

```ts
if(!user || user.password != loginForm.password){
    throw new UnauthorizedException('Les informations sont invalides')
}
```

Après :

```ts
if(!user || !(await bcrypt.compare(loginForm.password, user.password))){
    throw new UnauthorizedException('Les informations sont invalides')
}
```

- ordre des arguments : `compare(clair, hash)` — le mot de passe reçu d'abord, le hash de la base ensuite
- le `||` court-circuite : si `user` est null, le `compare` n'est jamais exécuté (pas de crash)
- même message d'erreur pour « email inconnu » et « mauvais mot de passe » : on ne révèle pas quels emails existent

Ne pas oublier l'import ici aussi.

#### Points d'attention

- les comptes créés AVANT bcrypt ont leur mot de passe en clair en base → `compare` échouera toujours pour eux. En dev : vider la table user (ou la supprimer, `synchronize : true` la recrée) et recréer les comptes
- le hash produit fait environ 60 caractères et commence par `$2b$10$...` → la colonne `@Column()` string convient telle quelle
- 10 salt rounds est le standard ; chaque +1 double le temps de calcul
- rien à changer côté sortie : `findOne` renvoie déjà un `UserDto` sans password (doc 11)