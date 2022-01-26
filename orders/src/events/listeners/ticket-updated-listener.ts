import { Listener, Subjects, TicketUpdatedEvent } from "@meticketing/common";
import { Ticket } from "../../models/ticket.model";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;
    async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {

        const ticket = await Ticket.findByEvent(data);
        
        if (!ticket) {
            throw new Error("Ticket not found");
        }

        ticket.set({
            title: data.title,
            price: data.price
        });
        await ticket.save();

        msg.ack();
    }
}