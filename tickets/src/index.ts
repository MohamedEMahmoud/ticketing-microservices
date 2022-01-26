import mongoose from 'mongoose';
import app from "./app";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";
(async () => {
    const Environment = ["JWT_KEY", "MONGO_URI", "NATS_CLUSTER_ID", "NATS_CLIENT_ID", "NATS_URL"];
    Environment.forEach(el => {
        if (!process.env[el]) {
            throw new Error(`${el} Must Be Defined`);
        }
    });

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!);
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed! from Tickets service");
            process.exit();
        });
        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions);
        mongoose.Promise = global.Promise;
        console.log("Connected to MongoDB Successfully From Tickets service");
    } catch (err) {
        console.log(err);
    }
    app.listen(3000, () => console.log('Listening on port 3000! From Tickets service '));
})();