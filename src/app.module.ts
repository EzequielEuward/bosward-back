import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PerfumesModule } from './modules/perfumes/perfumes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { User } from './modules/users/user.entity';
import { Perfume } from './modules/perfumes/perfume.entity';
import { Order } from './modules/orders/order.entity';
import { OrderItem } from './modules/orders/order-item.entity';
import { StockModule } from './modules/stock/stock.module';
import { StockMovement } from './modules/stock/entities/stock-movement.entity';
import { PaymentsModule } from './modules/payments/payments.module';
import { Payment } from './modules/payments/payment.entity';
import { CustomersModule } from './modules/customers/customers.module';
import { Customer } from './modules/customers/customer.entity';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { WishlistItem } from './modules/wishlist/wishlist-item.entity';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    // Variables de entorno disponibles globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Configuración de TypeORM desde variables de entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'ward_perfumes'),
        entities: [User, Perfume, Order, OrderItem, StockMovement, Payment, Customer, WishlistItem],
        synchronize: config.get<boolean>('DB_SYNC', true), // Solo en desarrollo
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    FirebaseModule,
    AuthModule,
    UsersModule,
    PerfumesModule,
    OrdersModule,
    StockModule,
    PaymentsModule,
    CustomersModule,
    WishlistModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }

