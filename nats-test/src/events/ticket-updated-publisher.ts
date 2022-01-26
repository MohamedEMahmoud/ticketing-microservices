import { Publisher } from './base-publisher';
import { Subjects } from "./subjects";
import { TicketUpdatedEvent } from "./ticket-updated-event";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly subject = Subjects.TicketUpdated;
}