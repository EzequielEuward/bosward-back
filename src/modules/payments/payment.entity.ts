import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Order } from '../orders/order.entity';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Order, { onDelete: 'CASCADE' })
    @JoinColumn()
    order: Order;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column({ default: 'MERCADOPAGO' })
    provider: string;

    @Column({ nullable: true })
    externalId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'json', nullable: true })
    rawPayload: unknown;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
