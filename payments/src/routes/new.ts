import express, { Request, Response } from "express";
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError } from "@meticketing/common";
import { Order, OrderStatus } from "../models/order.model";
import { Payment } from "../models/payment.model";
import { body } from "express-validator";
import { stripe } from "../stripe";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

router.post(
    "/api/payments",
    requireAuth,
    [
        body("token").not().isEmpty(),
        body("orderId").not().isEmpty(),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError("Cannot pay for an cancelled order");
        }

        const charge = await stripe.charges.create({
            currency: "usd",
            amount: order.price * 100,
            source: token
        });
        const payment = Payment.build({
            orderId: order.id,
            stripeId: charge.id
        });
        await payment.save();

       await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        });
        
        res.status(201).send({ status: 201, payment, success: true });
    });

export { router as newPaymentRouter };