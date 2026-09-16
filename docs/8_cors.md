# CORS

#### Théorie

Par défaut, le navigateur applique la Same-Origin Policy : une page servie sur une origine (ex : un front Angular sur `http://localhost:4200`) n'a pas le droit de lire les réponses d'une autre origine (notre API sur `http://localhost:3000`). Une origine = protocole + domaine + port.

CORS (Cross-Origin Resource Sharing) est le mécanisme par lequel le serveur déclare quelles origines peuvent l'appeler, via des headers de réponse (`Access-Control-Allow-Origin`, ...). Pour les requêtes « non simples » (JSON, header `Authorization`), le navigateur envoie d'abord une requête preflight `OPTIONS` pour demander la permission.

À bien comprendre : CORS protège côté navigateur uniquement. Postman, curl ou Swagger ne sont pas concernés — ce n'est pas une sécurité serveur, ce sont les guards qui protègent l'API.

#### Activation — main.ts

```ts
app.enableCors({
  // origin : 'http://localhost:4200',                      ← restreindre aux origines listées
  // methods : ['GET','POST'],                              ← verbes autorisés
  // allowedHeaders : ['Content-Type' , 'Authorization'],   ← headers autorisés
  // credentials : true                                     ← autoriser les cookies cross-origin
})
```

- sans options (tout en commentaire) : tout est ouvert → header `access-control-allow-origin: *` sur chaque réponse. Acceptable en développement
- en production : décommenter et restreindre `origin` aux domaines du front
