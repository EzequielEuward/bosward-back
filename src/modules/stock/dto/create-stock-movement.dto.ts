import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StockMovementType } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
    @ApiProperty({ description: 'ID of the perfume' })
    @IsNotEmpty()
    @IsString()
    perfumeId: string;

    @ApiProperty({ enum: StockMovementType, description: 'Type of movement: ENTRY, EXIT, or ADJUSTMENT' })
    @IsEnum(StockMovementType)
    @IsNotEmpty()
    type: StockMovementType;

    @ApiProperty({ description: 'Amount of stock to move (positive integer)' })
    @IsInt()
    @Min(0)
    quantity: number;

    @ApiProperty({ description: 'Reason for the movement (e.g., Sale, Restock, Damaged)' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    reason: string;
}
