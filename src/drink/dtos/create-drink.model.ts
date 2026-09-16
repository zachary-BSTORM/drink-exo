import { ApiProperty } from "@nestjs/swagger";

export class CreateDrink{

    @ApiProperty({example : 'Coca-cola'})
    nom : string
    
    
    @ApiProperty({example : 'soda'})
    type : string
    
    
    @ApiProperty({example : 2.5})
    price : number
    
    
    @ApiProperty({example : 10})
    stock : number
    
    
    @ApiProperty({example : 'https://www.src/image.png'})
    imageurl : string
    
    
    @ApiProperty({example : '2027-01-01'})
    exp : Date
}