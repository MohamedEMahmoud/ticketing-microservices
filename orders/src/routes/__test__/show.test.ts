import request from "supertest";
import app from "../../app";
import { Ticket } from "../../models/ticket.model";

it('Returns an error if the order does not exist', async () => {

    const { cookie } = global.signin();

    const orderId = global.MongooseId();
    await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Cookie", cookie)
        .expect(404);
});

it('returns an error if one user tries to fetch another users order', async () => {

    const { cookie } = global.signin();

    // Create a ticket
    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: 'test',
        price: 20,
    });
    await ticket.save();

    // make a request to build an order with this ticket
    const { body: { order: { id } } } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make request to fetch the order
    await request(app)
        .get(`/api/orders/${id}`)
        .set('Cookie', global.signin().cookie)
        .send()
        .expect(401);
});

it('fetches the order', async () => {

    const { cookie } = global.signin();

    // Create a ticket
    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: "test",
        price: 100
    });
    await ticket.save();

    // make a request to build an order with this ticket
    const { body: { order: { id } } } = await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .send({ ticketId: ticket.id })
        .expect(201);
    // make request to fetch the order
    const response = await request(app)
        .get(`/api/orders/${id}`)
        .set("Cookie", cookie)
        .expect(200);
    expect(response.body.order.id).toEqual(id);
});