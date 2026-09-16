import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Drink {

    @PrimaryGeneratedColumn()
    id : number

    @Column()
    nom : string
    
    
    @Column()
    type : string
    
    
    @Column('float')
    price : number
    
    
    @Column('int')
    stock : number

    @Column()
    imageurl : string

    @CreateDateColumn()
    createdAt : Date

    @Column()
    exp : Date
}