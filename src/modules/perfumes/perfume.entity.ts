import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from '../orders/order-item.entity';

@Entity('perfumes')
export class Perfume {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column()
    brand: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    containerMaterial: string;

    @Column({ nullable: true })
    size: string;

    /** Aromas almacenados como JSON array */
    @Column({ type: 'json', nullable: true })
    aromas: string[];

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ nullable: true })
    imageUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrderItem, (item) => item.perfume)
    orderItems: OrderItem[];
}
