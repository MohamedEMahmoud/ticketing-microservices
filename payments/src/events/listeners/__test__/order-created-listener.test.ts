import { OrderCreatedEvent } from "@meticketing/common";
import { OrderCreatedListener } from "../order-created-listener";
import { Order, OrderStatus } from "../../../models/order.model";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent["data"] = {
        id: global.MongooseId(),
        userId: global.MongooseId(),
        version: 0,
        expiresAt: "Fri",
        status: OrderStatus.Created,
        ticket: {
            id: global.MongooseId(),
            price: 200
        }
    };

    const msg = global.fakeMessage();

    return { listener, data, msg };
};

it("replicates the order information", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it("ack the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});