import { Listener, Subjects, TicketCreatedEvent } from "@meticketing/common";
import { Ticket } from "../../models/ticket.model";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        const ticket = await Ticket.build({
            id: data.id,
            title: data.title,
            price: data.price,
        });
        await ticket.save();
        msg.ack();
    }
}