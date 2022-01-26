import { OrderCancelledEvent } from "@meticketing/common";
import { Ticket } from "../../../models/ticket.model";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from '../../../nats-wrapper';


const setup = async () => {
    
    const { id: userId } = global.signin();

    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = global.MongooseId();
    const ticket = Ticket.build({
        title: 'test',
        price: 200,
        userId,
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent["data"] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    };

    const msg = global.fakeMessage();

    return { listener, data, msg, ticket };
};

it("updates the ticket, publishes an event, and ack the message", async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedData = await Ticket.findById(ticket.id);

    expect(updatedData!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});