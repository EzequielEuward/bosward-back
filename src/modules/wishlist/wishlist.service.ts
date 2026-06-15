import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './wishlist-item.entity';
import { User } from '../users/user.entity';
import { PerfumesService } from '../perfumes/perfumes.service';

@Injectable()
export class WishlistService {
    constructor(
        @InjectRepository(WishlistItem)
        private readonly wishlistRepository: Repository<WishlistItem>,
        private readonly perfumesService: PerfumesService,
    ) { }

    list(userId: string): Promise<WishlistItem[]> {
        return this.wishlistRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    async add(user: User, perfumeId: string): Promise<WishlistItem> {
        const perfume = await this.perfumesService.findOne(perfumeId);

        const existing = await this.wishlistRepository.findOne({
            where: { user: { id: user.id }, perfume: { id: perfumeId } },
        });
        if (existing) throw new ConflictException('El perfume ya está en la wishlist');

        const item = this.wishlistRepository.create({ user, perfume });
        return this.wishlistRepository.save(item);
    }

    async remove(userId: string, perfumeId: string): Promise<void> {
        await this.wishlistRepository.delete({
            user: { id: userId },
            perfume: { id: perfumeId },
        });
    }
}
