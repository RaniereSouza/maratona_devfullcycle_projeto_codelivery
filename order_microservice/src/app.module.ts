import { Module }        from '@nestjs/common';
import { ConfigModule }  from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from './app.controller';
import { AppService }    from "./app.service";

import { OrderModule } from './order/order.module';
import { Order }       from "./order/order.model";

import { CommandsModule } from "./commands/commands.module";

@Module({
  imports: [
      ConfigModule.forRoot({
        envFilePath: '.env'
      }),
      TypeOrmModule.forRoot({
        type:     'mysql',
        host:     'db',
        port:     3306,
        username: 'root',
        password: 'root',
        database: 'micro_orders',
        entities: [Order],
      }),
      OrderModule,
      CommandsModule,
  ],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule { }
