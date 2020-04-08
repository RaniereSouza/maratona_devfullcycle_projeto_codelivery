import { Module }        from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrderModule } from './order/order.module';
import { Order }       from "./order/order.model";

import { AppController } from './app.controller';
import { AppService }    from "./app.service";

@Module({
  imports: [
      TypeOrmModule.forRoot({
          type:     'mysql',
          host:     'db',
          port:     3306,
          username: 'root',
          password: 'root',
          database: 'micro_mapping',
          entities: [Order],
      }),
      OrderModule,
  ],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule { }
