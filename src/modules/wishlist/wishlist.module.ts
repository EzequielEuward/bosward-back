import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistItem } from './wishlist-item.entity';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { PerfumesModule } from '../perfumes/perfumes.module';

@Module({
    imports: [TypeOrmModule.forFeature([WishlistItem]), PerfumesModule],
    controllers: [WishlistController],
    providers: [WishlistService],
})
export class WishlistModule { }
