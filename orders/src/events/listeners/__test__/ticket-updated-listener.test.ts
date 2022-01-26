import { TicketUpdatedListener } from "../ticket-updated-listener";
import { TicketUpdatedEvent } from "@meticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket.model";

const setup = async () => {

    const { id: userId } = global.signin();

    // Create listener
    const listener = await new TicketUpdatedListener(natsWrapper.client);

    // Create a fake msg object
    const msg = global.fakeMessage();

    // Create and save a ticket
    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: "test#1",
        price: 200,
    });
    await ticket.save();

    // Create a fake data object
    const data: TicketUpdatedEvent["data"] = {
        id: ticket.id,
        title: "test#2",
        price: 100,
        userId,
        version: ticket.version + 1
    };
    // return all of this stuff
    return { listener, data, msg, ticket };
};

it("finds, updates, and saves a ticket", async () => {

    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);

});

it("ack the message", async () => {

    const { listener, data, msg } = await setup();


    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();

});

it('does not call ack if the event has a skipped version number', async () => {
    const { listener, data, msg } = await setup();

    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    } catch (err) { }
    expect(msg.ack).not.toHaveBeenCalled();
});