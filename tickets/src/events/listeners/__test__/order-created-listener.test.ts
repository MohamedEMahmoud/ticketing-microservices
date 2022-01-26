import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket.model";
import { OrderCreatedEvent, OrderStatus } from "@meticketing/common";


const setup = async () => {

    const { id: userId } = global.signin();

    const listener = await new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: "test",
        price: 20,
        userId
    });
    await ticket.save();

    const data: OrderCreatedEvent["data"] = {
        id: global.MongooseId(),
        status: OrderStatus.Created,
        expiresAt: "Fri",
        userId: ticket.userId,
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    };

    const msg = global.fakeMessage();

    return { listener, data, msg, ticket };
};

it("sets the userId of the ticket", async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it("ack the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // return data from mock function
    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(data.id).toEqual(ticketUpdatedData.orderId);
});