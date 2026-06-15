import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn
} from 'typeorm';
import { Perfume } from '../../perfumes/perfume.entity';
import { User } from '../../users/user.entity';

export enum StockMovementType {
    ENTRY = 'ENTRY',
    EXIT = 'EXIT',
    ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('stock_movements')
export class StockMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: StockMovementType })
    type: StockMovementType;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'varchar', length: 255 })
    reason: string;

    // Relación con el Perfume (o Producto)
    @ManyToOne(() => Perfume, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'perfumeId' })
    perfume: Perfume;

    @Column()
    perfumeId: string;

    // Relación opcional con el Usuario (admin) que realizó el movimiento
    // Usando ManyToOne diferido si hay problemas de importación circular, pero User Entity debe existir.
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;
}
