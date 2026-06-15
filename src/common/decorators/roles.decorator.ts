import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';

/** Decora un endpoint con los roles permitidos */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
