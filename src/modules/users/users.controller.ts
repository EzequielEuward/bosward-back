import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    ForbiddenException,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '../../common/enums/roles.enum';
import { User } from './user.entity';

@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(Role.SUPERADMIN)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(Role.ADMINISTRADOR, Role.SUPERADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() currentUser: User,
    ) {
        this.assertSelfOrAdmin(currentUser, id);
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
        @GetUser() currentUser: User,
    ) {
        this.assertSelfOrAdmin(currentUser, id);
        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/role')
    @Roles(Role.SUPERADMIN)
    setRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() assignRoleDto: AssignRoleDto,
    ) {
        return this.usersService.setRole(id, assignRoleDto.role);
    }

    @Delete(':id')
    @Roles(Role.SUPERADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.remove(id);
    }

    private assertSelfOrAdmin(currentUser: User, id: string) {
        const isAdmin =
            currentUser.role === Role.ADMINISTRADOR ||
            currentUser.role === Role.SUPERADMIN;
        if (!isAdmin && currentUser.id !== id) {
            throw new ForbiddenException('No podés acceder al perfil de otro usuario');
        }
    }
}
