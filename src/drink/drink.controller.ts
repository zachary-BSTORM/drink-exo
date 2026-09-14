import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CreateDrink } from './dtos/create-drink.model.js';
import { UpdateDrink } from './dtos/update-drink.model.js';
import { UpdateStockDrink } from './dtos/update-stock-drink.model.js';
import { DrinkService } from './drink.service.js';
import { Drink } from './entity/drink.model.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('drink')
@UseGuards(AuthGuard)
export class DrinkController {

    constructor(private drinkService : DrinkService){}

    @Get()
    findAll() : Drink[]{
        return this.drinkService.findAll()
    }

    @Get(':id')
    findOne(@Param('id' , ParseIntPipe) id : number) : Drink{
        return this.drinkService.findOne(id)
    }

    @Post()
    @UseGuards(AuthGuard)
    create(@Body() newDrink : CreateDrink) : Drink{
        return this.drinkService.create(newDrink)
    }
    
    @Put(':id')
    @UseGuards(AuthGuard)
    update(
        @Param('id',ParseIntPipe) id : number,
        @Body() updatedDrink : UpdateDrink
    ) : Drink{
        return this.drinkService.update(id,updatedDrink)
    }
    
    @Put('stock/:id')
    @UseGuards(AuthGuard)
    updatStock(
        @Param('id' , ParseIntPipe) id : number,
        @Body() updatedStock : UpdateStockDrink
    ) : Drink{
        return this.drinkService.updateStock(id,updatedStock)
    }
    
    @Delete(':id')
    @UseGuards(AuthGuard)
    @HttpCode(204)
    delete(@Param('id' , ParseIntPipe) id : number) : void{
        return this.drinkService.delete(id)
    }
}
