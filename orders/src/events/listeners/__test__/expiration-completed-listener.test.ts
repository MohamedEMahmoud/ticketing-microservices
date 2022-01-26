import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompletedEvent } from "@meticketing/common";
import { Ticket } from "../../../models/ticket.model";
import { Order, OrderStatus } from "../../../models/order.model";
import { ExpirationCompletedListener } from "../expiration-completed-listener";

jest.mock("../../../nats-wrapper");
const setup = async () => {

    const { id: userId } = global.signin();
    const listener = new ExpirationCompletedListener(natsWrapper.client);
    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: "test",
        price: 200,
    });
    await ticket.save();

    const order = Order.build({
        userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const data: ExpirationCompletedEvent["data"] = {
        orderId: order.id,
    };

    const msg = global.fakeMessage();

    return { listener, data, msg, ticket, order };
};

it("updates the order status to cancelled", async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it("publishes an OrderCancelled Event", async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);


    const updatedOrder = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(updatedOrder!.id).toEqual(order.id);


});


it("ack the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});