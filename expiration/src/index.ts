import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
(async () => {
    const Environment = ["NATS_CLUSTER_ID", "NATS_CLIENT_ID", "NATS_URL", "REDIS_HOST"];
    Environment.forEach(el => {
        if (!process.env[el]) {
            throw new Error(`${el} Must Be Defined`);
        }
    });

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!);
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed! from Expiration service");
            process.exit();
        });
        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        
    } catch (err) {
        console.log(err);
    }
})();