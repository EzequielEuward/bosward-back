import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/users/user.entity';

/** Extrae el usuario autenticado del request */
export const GetUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): User => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as User;
    },
);
