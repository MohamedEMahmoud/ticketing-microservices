import request from 'supertest';
import app from '../../app';


const createTicket = () => {
    
    const { cookie } = global.signin();

    return request(app)
        .post('/api/tickets')
        .set("Cookie", cookie)
        .send({
            title: "ticket#1",
            price: 20
        });
};

it("Can fetch a list of tickets", async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app).get('/api/tickets').expect(200);

    expect(response.body.tickets.length).toEqual(3);
});