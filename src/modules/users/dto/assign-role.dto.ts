import { IsEnum } from 'class-validator';
import { Role } from '../../../common/enums/roles.enum';

export class AssignRoleDto {
    @IsEnum(Role)
    role: Role;
}
