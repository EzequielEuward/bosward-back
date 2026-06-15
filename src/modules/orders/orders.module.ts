import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Perfume } from '../perfumes/perfume.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem, Perfume])],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }
