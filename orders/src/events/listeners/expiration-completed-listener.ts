import { Listener, Subjects, ExpirationCompletedEvent } from "@meticketing/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order, OrderStatus } from "../../models/order.model";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent> {
    readonly subject = Subjects.ExpirationCompleted;
    queueGroupName = queueGroupName;
    async onMessage(data: ExpirationCompletedEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId).populate("ticket");
        if (!order) {
            throw new Error("Order Not Found");
        }

        if (order.status === OrderStatus.Cancelled) {
            return msg.ack();
        }
        
        order.set({
            status: OrderStatus.Cancelled
        });
        await order.save();
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });
        msg.ack();
    }
}