import { Listener, Subjects, OrderCancelledEvent } from "@meticketing/common";
import { Ticket } from '../../models/ticket.model';
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {

        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error("Ticket Not Found");
        }

        ticket.set({ orderId: undefined });

        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        msg.ack();
    }
}