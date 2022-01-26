import { PaymentCreatedEvent, Publisher, Subjects } from "@meticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    readonly subject = Subjects.PaymentCreated;
}