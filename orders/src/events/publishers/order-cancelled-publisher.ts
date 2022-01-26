import { Publisher, Subjects, OrderCancelledEvent } from "@meticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}