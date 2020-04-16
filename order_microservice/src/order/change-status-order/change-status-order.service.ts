import  { Injectable }       from '@nestjs/common';
import  { 
            WebSocketGateway, 
            WebSocketServer, 
            OnGatewayConnection,
            OnGatewayDisconnect 
        }                    from '@nestjs/websockets';
import  { InjectRepository } from "@nestjs/typeorm";
import  { RabbitSubscribe }  from '@golevelup/nestjs-rabbitmq';

import { Repository }     from "typeorm";
import { Server, Client } from 'socket.io';

import { Order } from "../order.model";

@Injectable()
@WebSocketGateway() // Socket.io
export class ChangeStatusOrderService implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>
    ) { }

    handleConnection (socket: Client) {
        console.log(`socket client connection with id ${socket.id}`);
    }
    handleDisconnect (socket: Client) {
        console.log(`socket client with id ${socket.id} disconnected...`);
    }

    @RabbitSubscribe({
        exchange:   'amq.direct',
        routingKey: 'orders.change-status',
        queue:      'orders/status'
    })
    public async rpcHandler(message) { //id, status

        const order = await this.orderRepo.findOne(message.id);
        
        if (order) {

            order.status = message.status;

            await this.orderRepo.save(order);
            this.server.emit(`order.change-status`, {id: order.id, status: message.status});
        }
    }
}