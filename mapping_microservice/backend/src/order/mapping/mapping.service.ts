import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { InjectRepository }                  from "@nestjs/typeorm";
import { AmqpConnection, RabbitSubscribe }   from "@golevelup/nestjs-rabbitmq";

import { Repository } from "typeorm";
import { Server }     from "socket.io";

import { Order, OrderStatus } from "../order.model";

@WebSocketGateway() //Socket.io
export class MappingService {

    @WebSocketServer() server: Server;

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        private amqpConnection:     AmqpConnection,
    ) { }


    @RabbitSubscribe({
        exchange:   'amq.direct',
        routingKey: 'mapping.new-position',
        queue:      'mapping/positions'
    })
    public async rpcHandler(message) { //lat, lng, order

        const lat = parseFloat(message.lat);
        const lng = parseFloat(message.lng);

        this.server.emit(`order.${message.order}.new-position`,{lat, lng});

        if ((lat === 0) && (lng === 0)) {
            
            const order = await this.orderRepo.findOne(message.order);

            if (order) {
                order.status = OrderStatus.DONE;
                await this.orderRepo.save(order);
                await this.amqpConnection.publish(
                    'amq.direct',
                    'orders.change-status',
                    {
                        id:     order.id,
                        status: OrderStatus.DONE
                    }
                )
            }
        }
    }
}
