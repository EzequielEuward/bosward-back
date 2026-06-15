import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('auth')
export class AuthController {
    @ApiOperation({ summary: 'Devuelve el usuario local autenticado (auto-provisionado)' })
    @Get('me')
    me(@GetUser() user: User) {
        return user;
    }
}
