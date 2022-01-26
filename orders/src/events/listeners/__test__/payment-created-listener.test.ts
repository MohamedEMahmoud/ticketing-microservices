import { natsWrapper } from "../../../nats-wrapper";
import { PaymentCreatedEvent } from "@meticketing/common";
import { Ticket } from "../../../models/ticket.model";
import { Order, OrderStatus } from "../../../models/order.model";
import { PaymentCreatedListener } from "../payment-created-listener";
const setup = async () => {
    const { id: userId } = global.signin();

    const listener = new PaymentCreatedListener(natsWrapper.client);
    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: "test",
        price: 200,
    });
    await ticket.save();

    const order = Order.build({
        userId,
        status: OrderStatus.Cancelled,
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const data: PaymentCreatedEvent["data"] = {
        id: global.MongooseId(),
        orderId: order.id,
        stripeId: global.MongooseId()
    };

    const msg = global.fakeMessage();

    return { listener, data, msg, ticket, order };
};

it("updates the order status to Complete", async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Complete);

});


it("ack the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});