import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../../modules/firebase/firebase.service';
import { UsersService } from '../../modules/users/users.service';
import { Role } from '../enums/roles.enum';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(
        private readonly firebase: FirebaseService,
        private readonly usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const header: string | undefined = request.headers.authorization;

        if (!header?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token no provisto');
        }

        let decoded: import('firebase-admin').auth.DecodedIdToken;
        try {
            decoded = await this.firebase.auth.verifyIdToken(header.slice(7));
        } catch {
            throw new UnauthorizedException('Token inválido o expirado');
        }

        const role = (decoded.role as Role) ?? Role.CLIENTE;

        const user = await this.usersService.provisionFromFirebase({
            firebaseUid: decoded.uid,
            email: decoded.email ?? '',
            name: (decoded.name as string) ?? decoded.email ?? 'Usuario',
            role,
        });

        user.role = role;
        request.user = user;
        return true;
    }
}
