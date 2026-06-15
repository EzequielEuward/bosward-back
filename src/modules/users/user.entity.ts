import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/roles.enum';
import { Order } from '../orders/order.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    firebaseUid: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'enum', enum: Role, default: Role.CLIENTE })
    role: Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];
}
