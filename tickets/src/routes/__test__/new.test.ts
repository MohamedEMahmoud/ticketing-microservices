import request from 'supertest';
import app from '../../app';
import { Ticket } from '../../models/ticket.model';
import { natsWrapper } from "../../nats-wrapper";


it("Has a route handler listening to /api/tickets for post requests", async () => {
    const response = await request(app).post('/api/tickets').send({});
    expect(response.status).not.toEqual(404);
});

it("Can only be accessed if the user is signed in", async () => {
    await request(app).post('/api/tickets').send({}).expect(401);
});

it("Returns a status other than 401 if the user is signed in ", async () => {
    const { cookie } = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({});

    expect(response.status).not.toEqual(401);
});

it("Returns an error if an invalid title is provided", async () => {
    const { cookie } = global.signin();

    await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "",
            price: 10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            price: 10
        })
        .expect(400);
});

it("Returns an error if an invalid price is provided", async () => {
    const { cookie } = global.signin();

    await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
        })
        .expect(400);
});

it("Creates a ticket with valid inputs", async () => {
    const { cookie } = global.signin();

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 10
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

it("publishes an event", async () => {
    const { cookie } = global.signin();

    await request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 10
        })
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});