# Configuration de TypeOrm


#### Installation

```bash
npm install @nestjs/typeorm typeorm pg
```


#### Configuration dans app.module.ts


```ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,                    // le port par défaut de PostgreSQL
  username: 'postgres',
  password: 'postgres',          // ← REMPLACER par le mot de passe de l'installation
  database: 'order_drink',       // ← la base créée dans pgAdmin
  entities: [Drink, User, Order, OrderItem],
  synchronize: true,
}),
```

#### Configuration des entités pour la DB


```ts
import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Drink {

    @PrimaryGeneratedColumn() // id autogénéré
    id : number

    @Column() // colonne par défaut string
    nom : string
    
    
    @Column()
    type : string
    
    
    @Column('float') // colonne de type spécifique : float
    price : number
    
    
    @Column('int') // colonne de type spécifique : int
    stock : number

    @Column()
    imageurl : string

    @CreateDateColumn() // date autogénéré 
    createdAt : Date

    @Column()
    exp : Date
}
```

- Entités avec relation 

```ts
@Entity()
export class Order {
    
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    userId : number; // foreignKey

    @ManyToOne(() => User)
    @JoinColumn({name : 'userId'}) // précise la foreign key
    user : User // relation avec la table lié 

    @OneToMany(() => OrderItem , (item) => item.order , 
    {
        cascade : true, // suppresion en cascase
        eager : true // récupère les éléments items lorsqu'on récupère une order
    })
    items : OrderItem[]; // relation avec la table lié


    @Column('float')
    total : number;

    @CreateDateColumn()
    createdAt : Date;
}


@Entity()
export class OrderItem {

    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    orderId : number

    @ManyToOne(() => Order , (order) => order.items)
    @JoinColumn({name : 'orderId'})
    order : Order

    @Column()
    drinkId : number;

    @ManyToOne(() => Drink)
    @JoinColumn({name : 'drinkId'})
    drink : Drink

    @Column('int')
    quantity : number;
    
    @Column('float')
    price : number;
}

    
```


#### Configuration dans les modules

- import de typeorm 

```ts
@Module({
    imports : [
        TypeOrmModule.forFeature([Order]), // donne accès au repository de typeorm
    DrinkModule
    ],
  controllers: [OrderController],
  providers: [OrderService],
})
```


#### Configuration dans les services

- Injection du Repository qui permet d'appeler les methodes de typeorm

```ts
 constructor(
    @InjectRepository(Order)
    private readonly orderRepository : Repository<Order>,
  ){}
```

- Modification du code des methodes
- par défaut le repository renvoie une promesse donc attention à l'asynchrone
- 

```ts
  findByUser(userId : number) : Promise<Order[]> {
    return this.orderRepository.find({where : {userId}})
  }
```

- ici on attend la réponse de findOne avant de continuer donc **await** 
- pour utiliser le **await** la methode doit être **async**
```ts
  async remove(id: number) : Promise<void> {
    const order = await  this.orderRepository.findOne({where : {id}})

    if(!order){
      throw new NotFoundException(`Aucune commande avec l'id : ${id}`)
    }

    this.orderRepository.remove(order)
  }
```