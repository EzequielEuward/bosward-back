import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perfume } from './perfume.entity';
import { CreatePerfumeDto } from './dto/create-perfume.dto';
import { UpdatePerfumeDto } from './dto/update-perfume.dto';
import { QueryPerfumeDto } from './dto/query-perfume.dto';

@Injectable()
export class PerfumesService {
    constructor(
        @InjectRepository(Perfume)
        private readonly perfumesRepository: Repository<Perfume>,
    ) { }

    findAll(query: QueryPerfumeDto): Promise<Perfume[]> {
        const { search, brand, gender, type, minPrice, maxPrice } = query;
        const qb = this.perfumesRepository.createQueryBuilder('perfume');

        if (search) {
            qb.andWhere('(perfume.name LIKE :search OR perfume.brand LIKE :search)', {
                search: `%${search}%`,
            });
        }
        if (brand) qb.andWhere('perfume.brand = :brand', { brand });
        if (gender) qb.andWhere('perfume.gender = :gender', { gender });
        if (type) qb.andWhere('perfume.type = :type', { type });
        if (minPrice !== undefined) qb.andWhere('perfume.price >= :minPrice', { minPrice });
        if (maxPrice !== undefined) qb.andWhere('perfume.price <= :maxPrice', { maxPrice });

        return qb.orderBy('perfume.createdAt', 'DESC').getMany();
    }

    async findOne(id: string): Promise<Perfume> {
        const perfume = await this.perfumesRepository.findOne({ where: { id } });
        if (!perfume) throw new NotFoundException(`Perfume con id ${id} no encontrado`);
        return perfume;
    }

    create(createPerfumeDto: CreatePerfumeDto): Promise<Perfume> {
        const perfume = this.perfumesRepository.create(createPerfumeDto);
        return this.perfumesRepository.save(perfume);
    }

    async update(id: string, updatePerfumeDto: UpdatePerfumeDto): Promise<Perfume> {
        const perfume = await this.findOne(id);
        Object.assign(perfume, updatePerfumeDto);
        return this.perfumesRepository.save(perfume);
    }

    async remove(id: string): Promise<void> {
        const perfume = await this.findOne(id);
        await this.perfumesRepository.remove(perfume);
    }
}
