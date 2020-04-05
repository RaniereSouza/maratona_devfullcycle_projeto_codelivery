import { Injectable }       from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { RabbitSubscribe }  from '@golevelup/nestjs-rabbitmq';

import { Repository } from "typeorm";

import { Order } from "../order.model";

@Injectable()
export class ChangeStatusOrderService {

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>
    ) { }

    @RabbitSubscribe({
        exchange:   'amq.direct',
        routingKey: 'orders.change-status',
        queue:      'orders/status'
    })
    public async rpcHandler(message) { //id, status
        const order = await this.orderRepo.findOne(message.id);
        order.status = message.status;
        return await this.orderRepo.save(order);
    }
}
