import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from '../users/user.entity';
import { Perfume } from '../perfumes/perfume.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [],
    [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        private readonly dataSource: DataSource,
    ) { }

    /** Crea una orden usando una transacción para garantizar consistencia */
    async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
        return this.dataSource.transaction(async (manager) => {
            let totalAmount = 0;
            const orderItems: OrderItem[] = [];

            for (const itemDto of createOrderDto.items) {
                const perfume = await manager.findOne(Perfume, {
                    where: { id: itemDto.perfumeId },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!perfume) {
                    throw new NotFoundException(
                        `Perfume con id ${itemDto.perfumeId} no encontrado`,
                    );
                }

                if (perfume.stock < itemDto.quantity) {
                    throw new BadRequestException(
                        `Stock insuficiente para "${perfume.name}". Disponible: ${perfume.stock}`,
                    );
                }

                // Descontar stock
                perfume.stock -= itemDto.quantity;
                await manager.save(perfume);

                const orderItem = manager.create(OrderItem, {
                    quantity: itemDto.quantity,
                    unitPrice: Number(perfume.price),
                    perfume,
                });

                totalAmount += Number(perfume.price) * itemDto.quantity;
                orderItems.push(orderItem);
            }

            const order = manager.create(Order, {
                user,
                items: orderItems,
                totalAmount,
            });

            return manager.save(order);
        });
    }

    /** Órdenes del usuario autenticado */
    findMyOrders(userId: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { user: { id: userId } },
            relations: ['items', 'items.perfume'],
            order: { createdAt: 'DESC' },
        });
    }

    /** Todas las órdenes (admin) */
    findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            relations: ['user', 'items', 'items.perfume'],
            order: { createdAt: 'DESC' },
        });
    }

    /** Cambiar estado de una orden (admin) */
    async updateStatus(
        id: string,
        updateOrderStatusDto: UpdateOrderStatusDto,
    ): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['items', 'items.perfume'],
        });
        if (!order) throw new NotFoundException(`Orden con id ${id} no encontrada`);

        const target = updateOrderStatusDto.status;
        if (order.status !== target && !ALLOWED_TRANSITIONS[order.status].includes(target)) {
            throw new BadRequestException(
                `Transición de estado inválida: ${order.status} → ${target}`,
            );
        }

        order.status = target;
        return this.ordersRepository.save(order);
    }
}
