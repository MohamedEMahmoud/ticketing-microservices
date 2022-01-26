import { Listener, Subjects, OrderCancelledEvent } from "@meticketing/common";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../models/order.model";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {

        const order = await Order.findByEvent(data);

        if (!order) {
            throw new Error("Order Not Found");
        }

        order.set({ status: OrderStatus.Cancelled });

        await order.save();

        msg.ack();
    }
}