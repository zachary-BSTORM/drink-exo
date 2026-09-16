# Les modules User et Order

## Le module User

#### L'entité — user/entity/user.model.ts

```ts
@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id : number;

    @Column({unique : true})        // contrainte UNIQUE en base : deux users ne peuvent pas avoir le même email
    email : string ;

    @Column()
    password : string;

    @Column({default : 'user'})     // valeur par défaut si non fournie
    role : string;

    @CreateDateColumn()
    createdAt : Date;
}
```

#### Le service — user/user.service.ts

```ts
@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository : Repository<User>
    ){}

    async create(newUser : CreateUser): Promise<User> {

        if(await this.findByEmail(newUser.email)){
            throw new ConflictException(`Email ${newUser.email} déja utilisé`)   // → 409
        }

        const user = this.userRepository.create({
            email : newUser.email,
            password : newUser.password,
            role : newUser.role
        })

        return this.userRepository.save(user)
    }

    findByEmail(email : string) : Promise<User | null>{
        return this.userRepository.findOne({where : {email}})
    }

    async findOne(id : number): Promise<UserDto>{
        const user = await this.userRepository.findOne({where : {id}})

        if(!user){
            throw new NotFoundException(`Aucun utilisateur avec l'id : ${id}`)
        }

        const userDto : UserDto = {          // on reconstruit un objet SANS le password
            id : user.id,
            email : user.email,
            role : user.role,
            createdAt : user.createdAt
        }

        return userDto
    }
}
```

- règle importante : le `password` ne sort jamais de l'API. `findOne` retourne un `UserDto` (id, email, role, createdAt) au lieu de l'entité complète
- `findByEmail` retourne l'entité complète (avec password) car `AuthService.login` en a besoin pour comparer — mais elle ne quitte pas le serveur

#### Le controller et le module

```ts
@Controller('user')
export class UserController {

    constructor(private userService : UserService){}

    @Get(':id')
    @UseGuards(AuthGuard)            // il faut être connecté pour consulter un profil
    findOne(@Param('id',ParseIntPipe) id : number) : Promise<UserDto>{
        return this.userService.findOne(id)
    }
}
```

```ts
@Module({
    imports : [TypeOrmModule.forFeature([User])],
    controllers : [UserController],
    providers : [UserService],
    exports : [UserService]          // AuthService (module auth) en a besoin
})
export class UserModule {}
```

## Le module Order

#### Récupérer l'utilisateur connecté — le pattern @Req()

Le `userId` d'une commande ne vient jamais du body (sinon n'importe qui commanderait au nom de n'importe qui) : il vient du token, que le middleware a décodé et posé sur `req.user`.

```ts
type AuthenticatedRequest = {user : {id : number , role : string}}   // le typage de req.user

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req : AuthenticatedRequest,            // ← toute la requête, avec le user du token
    @Body() createOrderDto: CreateOrderDto
  ) : Promise<Order>{
    return this.orderService.create(createOrderDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findbyUser(@Req() req : AuthenticatedRequest) : Promise<Order[]>{
    return this.orderService.findByUser(req.user.id);      // mes commandes uniquement
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Req() req : AuthenticatedRequest,
    @Param('id') id: number
  ): Promise<Order | null>{
    return this.orderService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: number): Promise<void> {
    return this.orderService.remove(id);
  }
}
```

- `@Req()` : injecte la requête complète ; le type `AuthenticatedRequest` évite le `any`
- le DTO :

```ts
export class CreateOrderItemDto {
    drinkId : number;
    quantity : number;
}

export class CreateOrderDto {
    items : CreateOrderItemDto[]     // une commande = une liste de (boisson, quantité)
}
```

#### La logique métier — order/order.service.ts

`DrinkService` est injecté depuis un autre module (voir le module plus bas) : c'est lui qui connaît les stocks et les prix.

```ts
async create(createOrderDto: CreateOrderDto, userId : number) : Promise<Order> {
    if(createOrderDto.items.length <= 0){
      throw new BadRequestException('Vous devez commander au moins une boisson')
    }

    const items : CreateItem[] = []

    for (const item of createOrderDto.items){
      if(item.quantity < 1){
        throw new BadRequestException(`La quantité doit être supérieur à 0`)
      }

      const drink = await this.drinkService.findOne(item.drinkId)   // 404 si la boisson n'existe pas

      if(drink.stock < item.quantity){
        throw new BadRequestException(`Stock insuffisant pour ${drink.nom}`)
      }

      items.push({
        drinkId : item.drinkId,
        price : drink.price,          // le prix vient du serveur, JAMAIS du client
        quantity : item.quantity
      })

      await this.drinkService.updateStock(drink.id , {stock : drink.stock - item.quantity})
    }

    const order = this.orderRepository.create({
      userId : userId,
      items : items,                  // cascade : les OrderItem sont insérés avec la commande
      total : items.reduce((sum,item) => sum + item.price * item.quantity, 0)
    })

    return await this.orderRepository.save(order)
}
```

Attention : le fichier actuel du projet contient `if(drink.stock > item.quantity)` et ignore silencieusement l'item quand le stock est insuffisant — à aligner sur la version ci-dessus (comparaison `drink.stock < item.quantity` + exception), sinon une commande peut être créée incomplète sans erreur.

Les lectures :

```ts
findByUser(userId : number) : Promise<Order[]> {
    return this.orderRepository.find({where : {userId}})
}

findOne(id: number, userId : number) : Promise<Order | null> {
    return this.orderRepository.findOne({where : {id , userId}})   // les DEUX conditions
}
```

- `where : {id , userId}` : une commande n'est visible que par son propriétaire — même si elle existe, un autre user ne la voit pas

#### Le module — l'injection entre modules

```ts
@Module({
    imports : [
        TypeOrmModule.forFeature([Order]),   // le repository de Order
        DrinkModule                          // donne accès à DrinkService (exporté par DrinkModule)
    ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
```
