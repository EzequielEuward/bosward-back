import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    documentId: string;

    @Column({ nullable: true })
    addressLine: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    province: string;

    @Column({ nullable: true })
    postalCode: string;

    @Column({ nullable: true })
    country: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
