import request from "supertest";
import app from "../../app";

it("Returns a 404 if the ticket is not found", async () => {
    const id = global.MongooseId();

    await request(app).get(`/api/tickets/${id}`).expect(404);
});

it("Returns the ticket if the ticket is found", async () => {
    const { cookie } = global.signin();

    const title = "concert";
    const price = 20;

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({ title, price })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.ticket.id}`)
        .expect(200);

    expect(ticketResponse.body.ticket.title).toEqual(title);
    expect(ticketResponse.body.ticket.price).toEqual(price);
});