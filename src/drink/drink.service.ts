import { Injectable, NotFoundException } from '@nestjs/common';
import { Drink } from './entity/drink.model.js';
import { CreateDrink } from './dtos/create-drink.model.js';
import { UpdateDrink } from './dtos/update-drink.model.js';
import { UpdateStockDrink } from './dtos/update-stock-drink.model.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DrinkService {

    constructor(
        @InjectRepository(Drink)
        private readonly drinkRepository : Repository<Drink>
    ){}


    async findAll() : Promise<Drink[]>{
        return await this.drinkRepository.find()
    }

    async findOne(id : number) : Promise<Drink> {
        const drink = await this.drinkRepository.findOne({where : {id}})

        if(!drink){
            throw new NotFoundException(`Aucune boisson avec l' id : ${id}`) // altgr + µ
        }

        return drink
    }

    async create(newDrink : CreateDrink) : Promise<Drink> {
            const drink = this.drinkRepository.create({
                nom : newDrink.nom,
                type : newDrink.type,
                price : newDrink.price,
                exp : newDrink.exp,
                imageurl : newDrink.imageurl,
                stock : newDrink.stock
            })

 
        return await this.drinkRepository.save(drink)
    }

    async update(id : number , updatedDrink : UpdateDrink) : Promise<Drink> {
        const drink = await this.findOne(id)

        Object.assign(drink,updatedDrink)

        return await this.drinkRepository.save(drink)

    }

    async updateStock(id : number , updatedStock : UpdateStockDrink) : Promise<Drink> {
        const drink = await this.findOne(id)

        if(updatedStock.stock < 0){
            throw new RangeError(`Le stock ne peut pas être négatif , valeur incorrecte : ${updatedStock.stock}`)
        }

        Object.assign(drink,updatedStock)
        return await this.drinkRepository.save(drink)
    }


    async delete(id : number) : Promise<void> {
        const drink = await this.findOne(id)

        if(!drink){
            throw new NotFoundException(`Aucune boisson avec l'id : ${id}`)
        }

        await this.drinkRepository.remove(drink)
    }
}
