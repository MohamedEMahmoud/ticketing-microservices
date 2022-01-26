import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketCreatedEvent } from "@meticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket.model";
const setup = async () => {

    const { id: userId } = global.signin();

    // create an instance of the listener
    const listener = await new TicketCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: TicketCreatedEvent["data"] = {
        id: global.MongooseId(),
        title: "test",
        price: 200,
        userId,
        version: 0
    };
    // create a fake message object
    const msg = global.fakeMessage();

    // create a fake message object
    return { listener, data, msg };
};

it("creates and saves a ticket", async () => {

    // call the onMessage function with data object + message object
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    // write assertion to make sure a ticket was created!
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual("test");
    expect(ticket!.id).toEqual(data.id);
});

it("acs the message", async () => {

    // call the onMessage function with data object + message object
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    // write assertion to make sure a ticket was created!
    expect(msg.ack).toHaveBeenCalled();
});