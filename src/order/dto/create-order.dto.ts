export class CreateOrderItemDto {
    drinkId : number;
    quantity : number;
}

export class CreateOrderDto {
    items : CreateOrderItemDto[]
}


export class CreateItem {
    drinkId : number;
    quantity : number;
    price : number
}
