import mongoose from 'mongoose';
import app from "./app";
import { ExpirationCompletedListener } from "./events/listeners/expiration-completed-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { natsWrapper } from "./nats-wrapper";
(async () => {

    const Environment = ["JWT_KEY", "MONGO_URI", "NATS_CLUSTER_ID", "NATS_CLIENT_ID", "NATS_URL", "EXPIRATION_WINDOW_SECONDS"];
    Environment.forEach(el => {
        if (!process.env[el]) {
            throw new Error(`${el} Must Be Defined`);
        }
    });

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!);
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed! from Orders service");
            process.exit();
        });
        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompletedListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions);
        mongoose.Promise = global.Promise;
        console.log("Connected to MongoDB Successfully From Orders service");
    } catch (err) {
        console.log(err);
    }
    app.listen(3000, () => console.log('Listening on port 3000! From Orders service'));
})();