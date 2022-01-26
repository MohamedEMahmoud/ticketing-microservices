import nats from 'node-nats-streaming';
import { randomBytes } from "crypto";
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
console.clear();

const stan = nats.connect("ticketing", "abc", {
    url: "http://localhost:4222"
});

stan.on("connect", async () => {
    console.log("Publisher connected to NATS");
    const publisher = new TicketCreatedPublisher(stan);
    try {
        await publisher.publish({
            id: "123",
            title: "concert",
            price: 20,
            userId: randomBytes(8).toString("hex"),
        });
    } catch (err) {
        console.error(err);
    }
});