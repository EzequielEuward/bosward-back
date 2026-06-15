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
    // Variables de entorno disponibles globalmente.
    // Carga .env.<NODE_ENV> (ej: .env.production) y luego .env como fallback.
    // En Render/Netlify las variables reales del entorno tienen prioridad sobre los archivos.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),

    // Configuración de TypeORM desde variables de entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const useSsl = config.get<string>('DB_SSL') === 'true';
        // synchronize solo se apaga si DB_SYNC === 'false' (las envs son strings)
        const synchronize = config.get<string>('DB_SYNC') !== 'false';

        return {
          type: 'postgres',
          // Render entrega un connection string (DATABASE_URL).
          // Si no existe, caemos a las variables sueltas (desarrollo local).
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: config.get<string>('DB_HOST', 'localhost'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.get<string>('DB_USERNAME', 'postgres'),
                password: config.get<string>('DB_PASSWORD', ''),
                database: config.get<string>('DB_DATABASE', 'ward_perfumes'),
              }),
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          entities: [User, Perfume, Order, OrderItem, StockMovement, Payment, Customer, WishlistItem],
          synchronize,
          logging: config.get<string>('NODE_ENV') !== 'production',
        };
      },
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

