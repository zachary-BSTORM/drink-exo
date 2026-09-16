import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { AuthGuard } from '../shared/guards/auth.guard.js';
import { AdminGuard } from '../shared/guards/admin.guard.js';
import { Order } from './entities/order.entity.js';

type AuthenticatedRequest = {user : {id : number , role : string}}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req : AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto
  ) : Promise<Order>{
    return this.orderService.create(createOrderDto,req.user.id);
  }
  
  @Get()
  @UseGuards(AuthGuard)
  findbyUser(@Req() req : AuthenticatedRequest) : Promise<Order[]>{
    return this.orderService.findByUser(req.user.id);
  }
  
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Req() req : AuthenticatedRequest,
    @Param('id') id: number
  ): Promise<Order | null>{
    return this.orderService.findOne(id,req.user.id);
  }
  
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: number): Promise<void> {
    return this.orderService.remove(id);
  }
}
