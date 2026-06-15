import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.orders, { eager: false, onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => OrderItem, (item) => item.order, {
        cascade: true,
        eager: true,
    })
    items: OrderItem[];
}
