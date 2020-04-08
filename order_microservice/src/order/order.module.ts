import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule }      from "@nestjs/typeorm";
import { RabbitMQModule }     from '@golevelup/nestjs-rabbitmq';

import { OrderController } from "./order.controller";
import { Order, }          from "./order.model";

import { ChangeStatusOrderService } from './change-status-order/change-status-order.service';
import { OrderSubscriberService }   from './order-subscriber/order-subscriber.service';
import { DriverHttpService }        from './driver-http/driver-http.service';

@Module({
    imports: [
        RabbitMQModule.forRoot(RabbitMQModule, {
            uri: 'amqp://admin:admin@rabbitmq:5672',
            connectionInitOptions: {
                wait:    false,
                reject:  false,
                timeout: 30000,
            }
        }),
        TypeOrmModule.forFeature([Order]),
        HttpModule
    ],
    controllers: [OrderController],
    providers: [
        ChangeStatusOrderService,
        OrderSubscriberService,
        DriverHttpService,
    ]
})
export class OrderModule { }
