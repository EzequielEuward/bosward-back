import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
@Controller('media')
export class MediaController {
    constructor(private readonly cloudinary: CloudinaryService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }))
    upload(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No se recibió ningún archivo');
        return this.cloudinary.upload(file);
    }

    @Get()
    list() {
        return this.cloudinary.list();
    }

    @Delete()
    async remove(@Query('publicId') publicId: string) {
        if (!publicId) throw new BadRequestException('Falta el publicId');
        await this.cloudinary.remove(publicId);
        return { success: true };
    }
}
