import { Injectable, NotFoundException } from '@nestjs/common';
import { Drink } from './entity/drink.model.js';
import { CreateDrink } from './dtos/create-drink.model.js';
import { UpdateDrink } from './dtos/update-drink.model.js';
import { UpdateStockDrink } from './dtos/update-stock-drink.model.js';

@Injectable()
export class DrinkService {

    drinks : Drink[] = []
    lastId = 0


    findAll() : Drink[]{
        return this.drinks;
    }

    findOne(id : number) : Drink {
        const drink = this.drinks.find(d => d.id == id)

        if(!drink){
            throw new NotFoundException(`Aucune boisson avec l' id : ${id}`) // altgr + µ
        }

        return drink
    }

    create(newDrink : CreateDrink) : Drink {
        const drink : Drink = {
            id : this.lastId + 1,
            nom : newDrink.nom,
            price : newDrink.price,
            stock : newDrink.stock,
            imageurl : newDrink.imageurl,
            exp : newDrink.exp,
            type : newDrink.type,
            createdAt : new Date()
        }

        this.drinks.push(drink)

        return drink
    }

    update(id : number , updatedDrink : UpdateDrink) : Drink {
        const drink = this.findOne(id)
        Object.assign(drink,updatedDrink)
        return drink

    }

    updateStock(id : number , updatedStock : UpdateStockDrink) : Drink {
        const drink = this.findOne(id)

        if(updatedStock.stock < 0){
            throw new RangeError(`Le stock ne peut pas être négatif , valeur incorrecte : ${updatedStock.stock}`)
        }

        Object.assign(drink,updatedStock)
        return drink
    }

    delete(id : number) : void {
        const index = this.drinks.findIndex(d => d.id == id)

        if(index == -1){
            throw new NotFoundException(`Aucune boisson avec l'id : ${id}`)
        }

        this.drinks.splice(index,1)
    }
}
