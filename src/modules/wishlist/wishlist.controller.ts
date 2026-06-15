import {
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    list(@GetUser() user: User) {
        return this.wishlistService.list(user.id);
    }

    @Post(':perfumeId')
    add(
        @GetUser() user: User,
        @Param('perfumeId', ParseUUIDPipe) perfumeId: string,
    ) {
        return this.wishlistService.add(user, perfumeId);
    }

    @Delete(':perfumeId')
    remove(
        @GetUser() user: User,
        @Param('perfumeId', ParseUUIDPipe) perfumeId: string,
    ) {
        return this.wishlistService.remove(user.id, perfumeId);
    }
}
