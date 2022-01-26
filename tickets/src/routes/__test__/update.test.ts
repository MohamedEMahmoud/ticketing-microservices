import request from "supertest";
import app from "../../app";
import { Ticket } from "../../models/ticket.model";
import { natsWrapper } from "../../nats-wrapper";


it("Returns a 404 if the provided id does not exist", async () => {
    const { cookie } = global.signin();
    await request(app)
        .put(`/api/tickets/${global.MongooseId()}`)
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 20
        }).expect(404);
});

it("Returns a 401 it the user is not Authorized", async () => {

    await request(app)
        .put(`/api/tickets/${global.MongooseId()}`)
        .send({
            title: "ticket#1",
            price: 20
        }).expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
    const { cookie } = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", global.signin().cookie)
        .send({
            title: "ticket#2",
            price: 50
        })
        .expect(401);
});

it("Returns a 400 if the user provides an invalid title or price", async () => {
    const { cookie } = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .send({
            title: "",
            price: 20
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .send({
            title: "ticket#3",
            price: -20
        })
        .expect(400);
});

it("Updates the ticket provided valid inputs", async () => {
    const { cookie } = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 100
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .send({
            title: "ticket#4",
            price: 500
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .expect(200);

    expect(ticketResponse.body.ticket.title).toEqual("ticket#4");
    expect(ticketResponse.body.ticket.price).toEqual(500);

});

it("publishes an event", async () => {
    const { cookie } = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 100
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .send({
            title: "ticket#4",
            price: 500
        })
        .expect(200);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
    const { cookie } = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 100
        })
        .expect(201);

    const ticket = await Ticket.findById(response.body.ticket.id);
    ticket!.set({ orderId: global.MongooseId() });
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.ticket.id}`)
        .set("Cookie", cookie)
        .send({
            title: "ticket#4",
            price: 500
        })
        .expect(400);
});