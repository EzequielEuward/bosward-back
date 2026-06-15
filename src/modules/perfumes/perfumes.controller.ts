import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PerfumesService } from './perfumes.service';
import { CreatePerfumeDto } from './dto/create-perfume.dto';
import { UpdatePerfumeDto } from './dto/update-perfume.dto';
import { QueryPerfumeDto } from './dto/query-perfume.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@Controller('perfumes')
export class PerfumesController {
    constructor(private readonly perfumesService: PerfumesService) { }

    @Get()
    findAll(@Query() query: QueryPerfumeDto) {
        return this.perfumesService.findAll(query);
    }

    /** GET /perfumes/:id — público */
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.perfumesService.findOne(id);
    }

    /** POST /perfumes — solo admin */
    @Post()
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
    create(@Body() createPerfumeDto: CreatePerfumeDto) {
        return this.perfumesService.create(createPerfumeDto);
    }

    /** PATCH /perfumes/:id — solo admin */
    @Patch(':id')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePerfumeDto: UpdatePerfumeDto,
    ) {
        return this.perfumesService.update(id, updatePerfumeDto);
    }

    /** DELETE /perfumes/:id — solo admin */
    @Delete(':id')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.perfumesService.remove(id);
    }
}
