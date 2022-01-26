import { Publisher, Subjects, TicketUpdatedEvent } from "@meticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}