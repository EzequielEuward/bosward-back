import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/roles.enum';
import { FirebaseService } from '../firebase/firebase.service';

interface ProvisionData {
    firebaseUid: string;
    email: string;
    name: string;
    role: Role;
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly firebase: FirebaseService,
    ) { }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
        return user;
    }

    async create(dto: CreateUserDto): Promise<User> {
        const role = dto.role ?? Role.CLIENTE;
        let firebaseUid: string;

        try {
            const firebaseUser = await this.firebase.auth.createUser({
                email: dto.email,
                password: dto.password,
                displayName: dto.name,
            });
            firebaseUid = firebaseUser.uid;
        } catch (error) {
            if ((error as { code?: string }).code === 'auth/email-already-exists') {
                throw new ConflictException('El email ya está registrado');
            }
            throw error;
        }

        await this.firebase.auth.setCustomUserClaims(firebaseUid, { role });

        return this.provisionFromFirebase({
            firebaseUid,
            email: dto.email,
            name: dto.name,
            role,
        });
    }

    async provisionFromFirebase(data: ProvisionData): Promise<User> {
        const byUid = await this.usersRepository.findOne({
            where: { firebaseUid: data.firebaseUid },
        });

        if (byUid) {
            if (byUid.role !== data.role || byUid.email !== data.email) {
                byUid.role = data.role;
                byUid.email = data.email;
                return this.usersRepository.save(byUid);
            }
            return byUid;
        }

        const byEmail = await this.usersRepository.findOne({
            where: { email: data.email },
        });

        if (byEmail) {
            byEmail.firebaseUid = data.firebaseUid;
            if (!byEmail.name) byEmail.name = data.name;
            return this.usersRepository.save(byEmail);
        }

        const created = this.usersRepository.create(data);
        return this.usersRepository.save(created);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async setRole(id: string, role: Role): Promise<User> {
        const user = await this.findOne(id);
        await this.firebase.auth.setCustomUserClaims(user.firebaseUid, { role });
        user.role = role;
        return this.usersRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.firebase.auth.deleteUser(user.firebaseUid).catch(() => undefined);
        await this.usersRepository.remove(user);
    }
}
