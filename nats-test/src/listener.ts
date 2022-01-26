import nats from "node-nats-streaming";
import { TicketCreatedListener } from "./events/ticket-created-listener";
import { TicketUpdatedListener } from "./events/ticket-updated-listener";

import { randomBytes } from 'crypto';
console.clear();

const stan = nats.connect("ticketing", randomBytes(8).toString("hex"), {
    url: "http://localhost:4222",
});

stan.on("connect", () => {
    console.log("Listener connected to NATS");

    new TicketCreatedListener(stan).listen();
    new TicketUpdatedListener(stan).listen();

    stan.on("close", () => {
        console.log("NATS connection closed!");
        process.exit();
    });
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());

