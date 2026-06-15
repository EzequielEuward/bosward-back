import {
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Perfume } from '../perfumes/perfume.entity';

@Entity('wishlist_items')
@Unique(['user', 'perfume'])
export class WishlistItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Perfume, { onDelete: 'CASCADE', eager: true })
    perfume: Perfume;

    @CreateDateColumn()
    createdAt: Date;
}
