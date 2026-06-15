import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '../../common/enums/roles.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../users/user.entity';

@ApiTags('Stock')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('stock')
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @ApiOperation({ summary: 'Create a new stock movement (Entry/Exit/Adjustment)' })
    @ApiBearerAuth()
    @Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
    @Post()
    async createMovement(
        @Body() createDto: CreateStockMovementDto,
        @GetUser() user: User
    ) {
        return this.stockService.createMovement(createDto, user.id);
    }

    @ApiOperation({ summary: 'Get stock movements history for a given perfume' })
    @ApiBearerAuth()
    @Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
    @Get('history/:perfumeId')
    async getHistory(@Param('perfumeId') perfumeId: string) {
        return this.stockService.getHistory(perfumeId);
    }
}
