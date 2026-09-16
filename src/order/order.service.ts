import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateItem, CreateOrderDto } from './dto/create-order.dto.js';
import { Order, OrderItem } from './entities/order.entity.js';
import { DrinkService } from '../drink/drink.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {


  constructor(
    @InjectRepository(Order)
    private readonly orderRepository : Repository<Order>,
    private drinkService : DrinkService
  ){}

  async create(createOrderDto: CreateOrderDto,userId : number) : Promise<Order> {
    if(createOrderDto.items.length <= 0){
      throw new BadRequestException('Vous devez commander au moins une boisson')
    }

    const items  : CreateItem[] = []

    for (const item of createOrderDto.items){
      if(item.quantity < 1){
        throw new BadRequestException(`La quantité doit être supérieur à 0`)
      }

      const drink = await this.drinkService.findOne(item.drinkId)

      if(drink.stock > item.quantity){

          items.push({
            drinkId : item.drinkId,
            price : drink.price,
            quantity : item.quantity
          })

          await this.drinkService.updateStock(drink.id , {stock : drink.stock - item.quantity})
      }
    }

    const order = this.orderRepository.create({
      userId : userId,
      items : items,
      total : items.reduce((sum,item) => sum + item.price * item.quantity,0)
    })

    return await this.orderRepository.save(order)
  }

  findByUser(userId : number) : Promise<Order[]> {
    return this.orderRepository.find({where : {userId}})
  }

  findOne(id: number,userId : number) : Promise<Order | null> {
    return this.orderRepository.findOne({where : {id,userId}})
  }

  async remove(id: number) : Promise<void> {
    const order = await  this.orderRepository.findOne({where : {id}})

    if(!order){
      throw new NotFoundException(`Aucune commande avec l'id : ${id}`)
    }

    await this.orderRepository.remove(order)
  }
}
