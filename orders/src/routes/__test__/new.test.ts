import request from 'supertest';
import app from '../../app';
import { Order, OrderStatus } from "../../models/order.model";
import { Ticket } from "../../models/ticket.model";
import { natsWrapper } from "../../nats-wrapper";

it("Returns an error if the ticket does not exist", async () => {

    const { cookie } = global.signin();

    const ticketId = global.MongooseId();
    await request(app)
        .post("/api/orders")
        .send({ ticketId })
        .set("Cookie", cookie)
        .expect(404);
});

it("Returns an error if the ticket is already reserved ", async () => {

    const { cookie, id: userId } = global.signin();

    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: "Concert",
        price: 200
    });
    await ticket.save();
    const order = Order.build({
        userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    });
    await order.save();
    await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .send({ ticketId: ticket.id })
        .expect(400);
});

it("reserves a ticket", async () => {

    const { cookie } = global.signin();

    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: "test",
        price: 200
    });
    await ticket.save();
    await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .send({ ticketId: ticket.id })
        .expect(201);
});

it("publishes an order created event", async () => {

    const { cookie } = global.signin();

    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: "test",
        price: 200
    });
    await ticket.save();
    await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .send({ ticketId: ticket.id })
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});