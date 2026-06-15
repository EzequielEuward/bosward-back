import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockMovement, StockMovementType } from './entities/stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { Perfume } from '../perfumes/perfume.entity';

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(StockMovement)
        private readonly stockMovementRepository: Repository<StockMovement>,
        @InjectRepository(Perfume)
        private readonly perfumeRepository: Repository<Perfume>,
        private readonly dataSource: DataSource,
    ) {}

    async createMovement(createDto: CreateStockMovementDto, userId?: string): Promise<StockMovement> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const perfume = await queryRunner.manager.findOne(Perfume, {
                where: { id: createDto.perfumeId },
            });

            if (!perfume) {
                throw new NotFoundException(`Perfume with ID ${createDto.perfumeId} not found`);
            }

            let newStock = perfume.stock;

            if (createDto.type === StockMovementType.ENTRY || createDto.type === StockMovementType.ADJUSTMENT) {
                // Para ajuste o entrada, simplemente sumamos / ajustamos.
                // En este caso ENTRY suma. Si es ADJUSTMENT, usualmente es establecer o sumar, vamos a considerarlo que suma/resta según signo.
                // Pero según DTO quantity es IsPositive. Así que ADJUSTMENT con quantity positiva sumará? 
                // Convención: ENTRY suma. EXIT resta. ADJUSTMENT reemplaza o suma. Haremos que ENTRY sume, EXIT reste, ADJUSTMENT puede restar o sumar (usar quantity para suma, restar con lógica específica, o simplificar).
                // Simplifiquemos: ENTRY suma, EXIT resta. ADJUSTMENT ignora validación estricta pero asumimos que reemplaza?
                // Mejor: ENTRY suma, EXIT resta. Dejamos que ADJUSTMENT aplique como ENTRY (suma) a menos que queramos definir un valor negativo, pero el DTO impide negativo. 
                // Así que trataremos ADJUSTMENT como un Entry por ahora o un reemplazo absoluto. Vamos a definir que ENTRY suma, EXIT resta.
                // Si type es ADJUSTMENT, tratémoslo como un reemplazo directo del stock (nueva cantidad).
                if (createDto.type === StockMovementType.ADJUSTMENT) {
                    newStock = createDto.quantity;
                } else {
                    newStock += createDto.quantity;
                }
            } else if (createDto.type === StockMovementType.EXIT) {
                if (perfume.stock < createDto.quantity) {
                    throw new BadRequestException(`Insufficient stock for perfume ${perfume.name}. Current total: ${perfume.stock}`);
                }
                newStock -= createDto.quantity;
            }

            // Update Perfume
            perfume.stock = newStock;
            await queryRunner.manager.save(Perfume, perfume);

            // Create Movement
            const movement = queryRunner.manager.create(StockMovement, {
                perfumeId: perfume.id,
                type: createDto.type,
                quantity: createDto.quantity,
                reason: createDto.reason,
                userId: userId, // undefined si no se provee
            });
            await queryRunner.manager.save(StockMovement, movement);

            await queryRunner.commitTransaction();
            return movement;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getHistory(perfumeId: string): Promise<StockMovement[]> {
        return this.stockMovementRepository.find({
            where: { perfumeId },
            order: { createdAt: 'DESC' },
            relations: ['user'], // Opcional, para ver qué admin lo hizo
        });
    }
}
