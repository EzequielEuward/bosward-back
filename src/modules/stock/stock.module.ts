import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockMovement } from './entities/stock-movement.entity';
import { Perfume } from '../perfumes/perfume.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([StockMovement, Perfume]),
    ],
    controllers: [StockController],
    providers: [StockService],
    exports: [StockService], // exportamos en caso de que un modulo futuro requiera mover stock
})
export class StockModule {}
