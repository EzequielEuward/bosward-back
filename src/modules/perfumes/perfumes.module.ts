import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfume } from './perfume.entity';
import { PerfumesService } from './perfumes.service';
import { PerfumesController } from './perfumes.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Perfume])],
    controllers: [PerfumesController],
    providers: [PerfumesService],
    exports: [PerfumesService], // Necesario para OrdersModule
})
export class PerfumesModule { }
