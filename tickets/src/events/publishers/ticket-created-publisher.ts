import { Publisher, Subjects, TicketCreatedEvent } from "@meticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}