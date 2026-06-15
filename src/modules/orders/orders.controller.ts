import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '../../common/enums/roles.enum';
import { User } from '../users/user.entity';

@UseGuards(FirebaseAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /** POST /orders — cualquier usuario autenticado */
    @Post()
    create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
        return this.ordersService.create(createOrderDto, user);
    }

    /**
     * GET /orders/my-orders — DEBE ir antes de /:id para que NestJS
     * no lo interprete como un UUID
     */
    @Get('my-orders')
    findMyOrders(@GetUser() user: User) {
        return this.ordersService.findMyOrders(user.id);
    }

    /** GET /orders — solo admin */
    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
    findAll() {
        return this.ordersService.findAll();
    }

    /** PATCH /orders/:id/status — solo admin */
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(id, updateOrderStatusDto);
    }
}
