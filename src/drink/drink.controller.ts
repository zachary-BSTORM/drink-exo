import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CreateDrink } from './dtos/create-drink.model.js';
import { UpdateDrink } from './dtos/update-drink.model.js';
import { UpdateStockDrink } from './dtos/update-stock-drink.model.js';
import { DrinkService } from './drink.service.js';
import { Drink } from './entity/drink.model.js';
import { AuthGuard } from '../shared/guards/auth.guard.js';
import { AdminGuard } from '../shared/guards/admin.guard.js';

@Controller('drink')
export class DrinkController {

    constructor(private drinkService : DrinkService){}

    @Get()
    findAll() :Promise<Drink[]>{
        return  this.drinkService.findAll()
    }

    @Get(':id')
    findOne(@Param('id' , ParseIntPipe) id : number) : Promise<Drink>{
        return  this.drinkService.findOne(id)
    }

    @Post()
    @UseGuards(AdminGuard)
    create(@Body() newDrink : CreateDrink) : Promise<Drink> {
        return this.drinkService.create(newDrink)
    }
    
    @Put(':id')
    @UseGuards(AdminGuard)
    update(
        @Param('id',ParseIntPipe) id : number,
        @Body() updatedDrink : UpdateDrink
    ) :  Promise<Drink>{
        return this.drinkService.update(id,updatedDrink)
    }
    
    @Put('stock/:id')
    @UseGuards(AdminGuard)
    updatStock(
        @Param('id' , ParseIntPipe) id : number,
        @Body() updatedStock : UpdateStockDrink
    ) :  Promise<Drink>{
        return this.drinkService.updateStock(id,updatedStock)
    }
    
    @Delete(':id')
    @UseGuards(AdminGuard)
    @HttpCode(204)
    delete(@Param('id' , ParseIntPipe) id : number) :  Promise<void>{
        return this.drinkService.delete(id)
    }
}
