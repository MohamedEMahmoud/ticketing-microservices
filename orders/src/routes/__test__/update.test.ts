import request from 'supertest';
import app from '../../app';
import { Ticket } from '../../models/ticket.model';
import { Order, OrderStatus } from '../../models/order.model';
import { natsWrapper } from "../../nats-wrapper";
it('marks an order as cancelled', async () => {

    const { cookie } = global.signin();

    // create a ticket with Ticket Model
    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    // make a request to create an order
    const { body: { order: { id } } } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make a request to cancel the order
    await request(app)
        .patch(`/api/orders/${id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);

    // expectation to make sure the thing is cancelled
    const updatedOrder = await Order.findById(id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publishes a order cancelled event', async () => {

    const { cookie } = global.signin();

    // create a ticket with Ticket Model
    const ticket = Ticket.build({
        id: global.MongooseId(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    // make a request to create an order
    const { body: { order: { id } } } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make a request to cancel the order
    await request(app)
        .patch(`/api/orders/${id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});