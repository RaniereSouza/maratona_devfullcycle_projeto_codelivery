import { Injectable }       from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RabbitSubscribe }  from "@golevelup/nestjs-rabbitmq";

import { Repository } from 'typeorm';

import { Order } from "../order.model";

@Injectable()
export class NewOrderService {

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>
    ) { }

    @RabbitSubscribe({
        exchange:   'amq.direct',
        routingKey: 'orders.new-order',
        queue:      'mapping/orders'
    })
    public async rpcHandler(message) {
        const order = this.orderRepo.create({
            id:           message.id,
            driver_name:  message.driver_name,
            location_id:  message.location_id,
            location_geo: message.location_geo,
        });
        await this.orderRepo.save(order);
    }
}

