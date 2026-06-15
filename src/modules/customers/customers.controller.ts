import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get('me')
    getMe(@GetUser() user: User) {
        return this.customersService.getOrCreate(user);
    }

    @Patch('me')
    updateMe(@GetUser() user: User, @Body() dto: UpdateCustomerDto) {
        return this.customersService.update(user, dto);
    }
}
