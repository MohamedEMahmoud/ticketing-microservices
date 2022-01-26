import request from 'supertest';
import app from '../../app';
import { Order, OrderStatus } from '../../models/order.model';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment.model';


it('returns a 404 when purchasing an order that does not exist', async () => {
    const { cookie } = global.signin();
    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'token.test',
            orderId: global.MongooseId(),
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const { cookie } = global.signin();

    const order = Order.build({
        id: global.MongooseId(),
        userId: global.MongooseId(),
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'token.test',
            orderId: order.id,
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const { cookie, id: userId } = global.signin();
    const order = Order.build({
        id: global.MongooseId(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            orderId: order.id,
            token: 'token.test',
        })
        .expect(400);
});

it('returns a 201 with valid input', async () => {
    const { cookie, id: userId } = global.signin();
    const order = Order.build({
      id: global.MongooseId(),
      userId,
      version: 0,
      price: 100,
      status: OrderStatus.Created,
    })
    await order.save()
  
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: 'tok_visa',
        orderId: order.id
      })
      .expect(201)
  
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
    expect(chargeOptions.source).toEqual('tok_visa')
    expect(chargeOptions.amount).toEqual(100 * 100)
    expect(chargeOptions.currency).toEqual('usd')
  
    const payment = await Payment.findOne({
      orderId: order.id
    })
    expect(payment!.stripeId).not.toBeNull()
  
  })
 