import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { User } from '../users/user.entity';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customersRepository: Repository<Customer>,
    ) { }

    async getOrCreate(user: User): Promise<Customer> {
        let customer = await this.customersRepository.findOne({
            where: { user: { id: user.id } },
        });

        if (!customer) {
            customer = this.customersRepository.create({ user });
            customer = await this.customersRepository.save(customer);
        }

        return customer;
    }

    async update(user: User, dto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.getOrCreate(user);
        Object.assign(customer, dto);
        return this.customersRepository.save(customer);
    }
}
