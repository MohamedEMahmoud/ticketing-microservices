import Queue from "bull";
import { ExpirationCompletedPublisher } from "../events/publishers/expiration-completed-event";
import { natsWrapper } from "../nats-wrapper";

interface PayLoad {
    orderId: string;
}

const expirationQueue = new Queue<PayLoad>("order:expiration", {
    redis: {
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) => {
    new ExpirationCompletedPublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    });
});

export { expirationQueue };