import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Perfume } from '../perfumes/perfume.entity';
import { Order } from './order.entity';

/** Tabla intermedia: detalle de perfumes en una orden */
@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    quantity: number;

    /** Precio en el momento de la compra (histórico) */
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    order: Order;

    @ManyToOne(() => Perfume, (perfume) => perfume.orderItems, { eager: true })
    perfume: Perfume;
}
