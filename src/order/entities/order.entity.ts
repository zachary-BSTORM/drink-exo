import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Drink } from "../../drink/entity/drink.model.js";
import { User } from "../../user/entity/user.model.js";


@Entity()
export class Order {
    
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    userId : number;

    @ManyToOne(() => User)
    @JoinColumn({name : 'userId'})
    user : User

    @OneToMany(() => OrderItem , (item) => item.order , 
    {
        cascade : true,
        eager : true
    })
    items : OrderItem[];


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

    
