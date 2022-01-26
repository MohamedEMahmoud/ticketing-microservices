import { Publisher, Subjects, ExpirationCompletedEvent } from "@meticketing/common";

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
    readonly subject = Subjects.ExpirationCompleted;
}



